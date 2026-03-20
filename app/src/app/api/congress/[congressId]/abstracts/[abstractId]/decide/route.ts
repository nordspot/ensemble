import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { getAbstract, updateAbstractStatus } from '@/lib/db/abstracts';
import { isOrganizer } from '@/lib/auth/permissions';
import { getFirst } from '@/lib/db/client';
import { sendEmail } from '@/lib/email/client';
import { abstractDecisionEmail } from '@/lib/email/templates/abstract-decision';
import { getCongress } from '@/lib/db/congresses';

interface RouteContext {
  params: Promise<{ congressId: string; abstractId: string }>;
}

// ── Schema ───────────────────────────────────────────────────────────

const decisionSchema = z.object({
  decision: z.enum(['accepted', 'rejected', 'revision_requested'] as const),
  notes: z.string().max(5000).optional(),
});

// ── POST /api/congress/[congressId]/abstracts/[abstractId]/decide ────

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Only organizers can make decisions on abstracts');
  }

  const { congressId, abstractId } = await context.params;

  // Verify abstract exists and belongs to this congress
  const abstract = await getAbstract(db, abstractId);
  if (!abstract || abstract.congress_id !== congressId) {
    return ERRORS.NOT_FOUND('Abstract not found');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const { decision, notes } = parsed.data;

  try {
    // Update abstract status
    await updateAbstractStatus(db, abstractId, decision, notes);

    // Send email to the author
    const congress = await getCongress(db, congressId);
    const author = await getFirst<{ email: string; first_name: string; last_name: string }>(
      db.prepare('SELECT email, first_name, last_name FROM profiles WHERE id = ?').bind(abstract.user_id)
    );

    if (author && congress) {
      const html = abstractDecisionEmail({
        name: `${author.first_name} ${author.last_name}`.trim(),
        congressName: congress.name,
        abstractTitle: abstract.title,
        decision,
        feedback: notes,
      });

      const decisionSubjects = {
        accepted: 'Abstract angenommen',
        rejected: 'Abstract-Entscheidung',
        revision_requested: 'Überarbeitung erbeten',
      };

      // Fire and forget: don't block the response on email delivery
      sendEmail({
        to: author.email,
        subject: `${congress.name}: ${decisionSubjects[decision]}`,
        html,
      }).catch((err) => {
        console.error('[ABSTRACT DECISION EMAIL ERROR]', err);
      });
    }

    const updated = await getAbstract(db, abstractId);
    return success({ abstract: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
