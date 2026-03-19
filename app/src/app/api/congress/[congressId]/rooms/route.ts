import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { listRooms, createRoom } from '@/lib/db/rooms';
import { getCongress } from '@/lib/db/congresses';
import { isOrganizer } from '@/lib/auth/permissions';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  floor: z.string().max(50).optional(),
  capacity: z.number().int().positive().optional(),
  equipment: z.array(z.string()).optional(),
  map_x: z.number().optional(),
  map_y: z.number().optional(),
  sort_order: z.number().int().nonnegative().optional(),
});

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

// GET /api/congress/[congressId]/rooms
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  const { congressId } = await context.params;

  try {
    const rooms = await listRooms(db, congressId);
    return success({ rooms });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}

// POST /api/congress/[congressId]/rooms
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

  if (!isOrganizer(auth.role)) {
    return ERRORS.FORBIDDEN('Organizer role required');
  }

  const congress = await getCongress(db, congressId);
  if (!congress) {
    return ERRORS.NOT_FOUND('Congress not found');
  }

  if (auth.organizationId !== congress.organization_id && auth.role !== 'admin' && auth.role !== 'superadmin') {
    return ERRORS.FORBIDDEN();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = createRoomSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return ERRORS.VALIDATION_ERROR(message);
  }

  try {
    const id = await createRoom(db, {
      congress_id: congressId,
      name: parsed.data.name,
      floor: parsed.data.floor,
      capacity: parsed.data.capacity,
      equipment: parsed.data.equipment,
      map_x: parsed.data.map_x,
      map_y: parsed.data.map_y,
      sort_order: parsed.data.sort_order,
    });

    return success({ id }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(message);
  }
}
