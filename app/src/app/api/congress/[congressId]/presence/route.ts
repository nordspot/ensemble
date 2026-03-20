import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, ERRORS } from '@/lib/api/response';
import { getDb, getRequestAuth } from '@/lib/api/server-helpers';
import { generateId } from '@/lib/db/client';

interface RouteContext {
  params: Promise<{ congressId: string }>;
}

interface ZoneCount {
  zone: string;
  count: number;
}

/**
 * GET /api/congress/[congressId]/presence
 * Returns zone occupancy counts (how many people in each zone).
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId } = await context.params;

  // Query beacon_presence grouped by zone
  // Only count recent entries (last 15 minutes) as "present"
  const result = await db
    .prepare(
      `SELECT zone, COUNT(DISTINCT user_id) as count
       FROM beacon_presence
       WHERE congress_id = ? AND updated_at > datetime('now', '-15 minutes')
       GROUP BY zone`,
    )
    .bind(congressId)
    .all<ZoneCount>();

  const zones: Record<string, number> = {};
  let total = 0;

  for (const row of result.results) {
    zones[row.zone] = row.count;
    total += row.count;
  }

  return success({ zones, total });
}

const presenceSchema = z.object({
  zone: z.string().min(1).max(100),
  beaconId: z.string().optional(),
  rssi: z.number().optional(),
});

/**
 * POST /api/congress/[congressId]/presence
 * Report a beacon sighting / zone entry.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const db = getDb();
  if (!db) return ERRORS.INTERNAL_ERROR('Database not available');

  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  const { congressId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ERRORS.VALIDATION_ERROR('Invalid JSON body');
  }

  const parsed = presenceSchema.safeParse(body);
  if (!parsed.success) {
    return ERRORS.VALIDATION_ERROR(parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  const { zone, beaconId, rssi } = parsed.data;

  // Check if user already has a presence record for this congress
  const existing = await db
    .prepare(
      'SELECT id, zone FROM beacon_presence WHERE congress_id = ? AND user_id = ?',
    )
    .bind(congressId, auth.userId)
    .first<{ id: string; zone: string }>();

  const previousZone = existing?.zone;

  if (existing) {
    // Update existing presence record
    await db
      .prepare(
        `UPDATE beacon_presence
         SET zone = ?, beacon_id = ?, rssi = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(zone, beaconId ?? null, rssi ?? null, existing.id)
      .run();
  } else {
    // Insert new presence record
    await db
      .prepare(
        `INSERT INTO beacon_presence (id, congress_id, user_id, zone, beacon_id, rssi, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      )
      .bind(generateId(), congressId, auth.userId, zone, beaconId ?? null, rssi ?? null)
      .run();
  }

  // Award gamification points for first zone entry
  // Only if this is a new zone (different from previous)
  if (previousZone !== zone) {
    // Check if user already got points for this zone
    const alreadyAwarded = await db
      .prepare(
        `SELECT id FROM points_ledger
         WHERE congress_id = ? AND user_id = ? AND reason = 'exhibitor_visit' AND description = ?`,
      )
      .bind(congressId, auth.userId, `zone:${zone}`)
      .first<{ id: string }>();

    if (!alreadyAwarded && zone.toLowerCase().includes('exhibitor')) {
      // Award points for exhibitor zone visit
      await db
        .prepare(
          `INSERT INTO points_ledger (id, congress_id, user_id, points, reason, description, created_at)
           VALUES (?, ?, ?, 10, 'exhibitor_visit', ?, datetime('now'))`,
        )
        .bind(generateId(), congressId, auth.userId, `zone:${zone}`)
        .run();
    }
  }

  // Return updated zone data
  const zoneResult = await db
    .prepare(
      `SELECT zone, COUNT(DISTINCT user_id) as count
       FROM beacon_presence
       WHERE congress_id = ? AND updated_at > datetime('now', '-15 minutes')
       GROUP BY zone`,
    )
    .bind(congressId)
    .all<ZoneCount>();

  const zones: Record<string, number> = {};
  let total = 0;

  for (const row of zoneResult.results) {
    zones[row.zone] = row.count;
    total += row.count;
  }

  return success({ zones, total, currentZone: zone });
}
