import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getCongress, updateCongress, deleteCongress } from '@/lib/db/congresses';
import { isOrganizer, isAdmin } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

// Zod schema for congress update
const updateCongressSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  venue_name: z.string().max(200).optional(),
  venue_address: z.string().max(300).optional(),
  venue_city: z.string().max(100).optional(),
  venue_country: z.string().max(2).optional(),
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  website: z.string().url().optional(),
  max_attendees: z.number().int().positive().optional(),
  registration_open: z.boolean().optional(),
  registration_deadline: z.string().optional(),
  abstract_submission_open: z.boolean().optional(),
  abstract_deadline: z.string().optional(),
  early_bird_deadline: z.string().optional(),
  early_bird_price_cents: z.number().int().nonnegative().optional(),
  regular_price_cents: z.number().int().nonnegative().optional(),
  status: z.enum(['draft', 'published', 'live', 'completed', 'archived']).optional(),
  settings: z.record(z.unknown()).optional(),
});

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

/**
 * GET /api/congress/[congressId]
 * Public if published/live, auth required if draft
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

  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  // Draft congresses require authentication
  if (congress.status === 'draft' || congress.status === 'archived') {
    const auth = await getRequestAuth();
    if (!auth) {
      return ERRORS.UNAUTHORIZED();
    }
    // Must belong to the same organization
    if (auth.organizationId !== congress.organization_id && !isAdmin(auth.role)) {
      return ERRORS.FORBIDDEN();
    }
  }

  return success(congress);
}

/**
 * PATCH /api/congress/[congressId]
 * Update congress (requires organizer role)
 */
export async function PATCH(
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

  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Organizer role required');
  }

  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  // Tenant isolation: must belong to same organization (unless admin)
  if (auth.organizationId !== congress.organization_id && !isAdmin(auth.role)) {
    return ERRORS.FORBIDDEN();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = updateCongressSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map(i => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  const input = parsed.data;

  // Validate date consistency if both are provided
  const startDate = input.start_date ?? congress.start_date;
  const endDate = input.end_date ?? congress.end_date;
  if (endDate < startDate) {
    return ERRORS.VALIDATION_ERROR('End date must be on or after start date');
  }

  await updateCongress(db, congressId, input);

  const updated = await getCongress(db, congressId);
  return success(updated);
}

/**
 * DELETE /api/congress/[congressId]
 * Delete congress (requires admin role)
 */
export async function DELETE(
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

  if (!isAdmin(auth.role)) {
    return ERRORS.FORBIDDEN('Admin role required');
  }

  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  // Tenant isolation: admin must belong to same org (unless superadmin)
  if (auth.organizationId !== congress.organization_id && auth.role !== 'superadmin') {
    return ERRORS.FORBIDDEN();
  }

  await deleteCongress(db, congressId);

  return success({ deleted: true });
}
