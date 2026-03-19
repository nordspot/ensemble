import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { listPublishedCongresses, listCongresses, createCongress, getCongressBySlug } from '@/lib/db/congresses';
import { isOrganizer } from '@/lib/auth/permissions';
import { slugSchema } from '@/lib/utils/validation';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import type { Congress } from '@/types';

// Zod schema for congress creation
const createCongressSchema = z.object({
  organization_id: z.string().min(1, 'Organization ID required'),
  name: z.string().min(1, 'Name required').max(200),
  slug: slugSchema,
  discipline: z.enum(['medical', 'engineering', 'legal', 'academic', 'scientific', 'other']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format'),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  venue_name: z.string().max(200).optional(),
  venue_city: z.string().max(100).optional(),
  venue_country: z.string().max(2).optional(),
});

/**
 * GET /api/congress
 * Public: list published congresses
 * Authenticated with org: list all congresses for that organization
 */
export async function GET(): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();

  let congresses: Congress[];

  if (auth?.organizationId) {
    congresses = await listCongresses(db, auth.organizationId);
  } else {
    congresses = await listPublishedCongresses(db);
  }

  return success(congresses);
}

/**
 * POST /api/congress
 * Create a new congress (requires organizer role)
 */
export async function POST(request: NextRequest): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const auth = await getRequestAuth();

  if (!auth) {
    return ERRORS.UNAUTHORIZED();
  }

  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Organizer role required');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createCongressSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map(i => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  // Check slug uniqueness within organization
  const existing = await getCongressBySlug(db, input.organization_id, input.slug);
  if (existing) {
    return ERRORS.CONFLICT('A congress with this slug already exists in this organization');
  }

  // Validate dates
  if (input.end_date < input.start_date) {
    return ERRORS.VALIDATION_ERROR('End date must be on or after start date');
  }

  const id = await createCongress(db, input);

  return success({ id }, 201);
}
