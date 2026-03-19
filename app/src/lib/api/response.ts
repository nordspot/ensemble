import { NextResponse } from 'next/server';

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiPaginated<T> {
  ok: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function success<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data } as const, { status });
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number): NextResponse<ApiPaginated<T>> {
  return NextResponse.json({ ok: true, data, meta: { total, page, pageSize } } as const);
}

export function error(code: string, message: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ ok: false, error: { code, message } } as const, { status });
}

export const ERRORS = {
  UNAUTHORIZED: (msg = 'Not authenticated') => error('UNAUTHORIZED', msg, 401),
  FORBIDDEN: (msg = 'Insufficient permissions') => error('FORBIDDEN', msg, 403),
  NOT_FOUND: (msg = 'Resource not found') => error('NOT_FOUND', msg, 404),
  VALIDATION_ERROR: (msg: string) => error('VALIDATION_ERROR', msg, 400),
  CONFLICT: (msg: string) => error('CONFLICT', msg, 409),
  RATE_LIMITED: (msg = 'Too many requests') => error('RATE_LIMITED', msg, 429),
  INTERNAL_ERROR: (msg = 'Unexpected error') => error('INTERNAL_ERROR', msg, 500),
} as const;
