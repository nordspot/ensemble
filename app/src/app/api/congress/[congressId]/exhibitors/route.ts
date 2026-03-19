import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { listExhibitors, getExhibitor, createExhibitor, createLead } from '@/lib/db/exhibitors';
import { isOrganizer } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

const createExhibitorSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  logo_url: z.string().url().optional(),
  website: z.string().url().optional(),
  booth_number: z.string().max(20).optional(),
  booth_size: z.enum(['small', 'medium', 'large', 'island']),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(30).optional(),
  products: z.array(z.string().max(100)).max(20).optional(),
});

const createLeadSchema = z.object({
  action: z.literal('create_lead'),
  exhibitor_id: z.string().min(1),
  user_id: z.string().min(1),
  notes: z.string().max(1000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * GET /api/congress/[congressId]/exhibitors
 * List exhibitors for a congress
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId } = await context.params;

  const exhibitors = await listExhibitors(db, congressId);
  return success(exhibitors);
}

/**
 * POST /api/congress/[congressId]/exhibitors
 * Create exhibitor (organizer) or create lead (exhibitor staff)
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();
  const { congressId } = await context.params;

  if (!auth) {
    return ERRORS.UNAUTHORIZED();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  // Check if this is a lead creation request
  const leadParsed = createLeadSchema.safeParse(body);
  if (leadParsed.success) {
    const input = leadParsed.data;
    const id = await createLead(db, {
      exhibitor_id: input.exhibitor_id,
      user_id: input.user_id,
      scanned_by: auth.userId,
      notes: input.notes,
      rating: input.rating,
    });
    return success({ id }, 201);
  }

  // Otherwise it's an exhibitor creation (requires organizer)
  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Organizer role required');
  }

  const parsed = createExhibitorSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const id = await createExhibitor(db, {
    ...parsed.data,
    congress_id: congressId,
  });

  const exhibitor = await getExhibitor(db, id);
  return success(exhibitor, 201);
}
