import type { D1Database } from '@/lib/db/client';

export async function logAudit(
  db: D1Database | null,
  entry: {
    congressId?: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  },
): Promise<void> {
  if (!db) return;
  try {
    await db
      .prepare(
        `INSERT INTO audit_log (id, congress_id, user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        entry.congressId ?? null,
        entry.userId ?? null,
        entry.action,
        entry.entityType,
        entry.entityId ?? null,
        JSON.stringify(entry.details ?? {}),
        entry.ipAddress ?? null,
      )
      .run();
  } catch {
    // Don't let audit logging failures break the request
    console.error('Audit log failed:', entry);
  }
}
