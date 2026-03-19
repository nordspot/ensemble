// D1 binding type (from Cloudflare Workers)
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

interface D1ExecResult {
  count: number;
  duration: number;
}

// Helper to get typed first result
export async function getFirst<T>(stmt: D1PreparedStatement): Promise<T | null> {
  const result = await stmt.first<T>();
  return result;
}

// Helper to get typed all results
export async function getAll<T>(stmt: D1PreparedStatement): Promise<T[]> {
  const result = await stmt.all<T>();
  return result.results;
}

// Helper to run a statement and return metadata
export async function run(stmt: D1PreparedStatement): Promise<{ changes: number; lastRowId: number }> {
  const result = await stmt.run();
  return { changes: result.meta.changes, lastRowId: result.meta.last_row_id };
}

// Parse D1 boolean (INTEGER 0/1) to JS boolean
export function toBool(value: number | null | undefined): boolean {
  return !!value;
}

// Parse D1 JSON text field
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Generate a new hex ID matching D1's lower(hex(randomblob(16)))
export function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
