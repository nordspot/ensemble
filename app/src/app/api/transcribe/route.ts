import { NextRequest, NextResponse } from 'next/server';
import { ERRORS } from '@/lib/api/response';
import { getRequestAuth } from '@/lib/api/server-helpers';

// ── Types ───────────────────────────────────────────────────

interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

interface TranscriptionWorkerResponse {
  segments: TranscriptSegment[];
}

/** Cloudflare service binding for the transcription worker. */
interface TranscriptionWorker {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  TRANSCRIPTION_WORKER?: TranscriptionWorker;
}

function getEnv(): Env {
  return globalThis as unknown as Env;
}

// ── POST handler ────────────────────────────────────────────

/**
 * Accepts an audio blob (multipart/form-data with "audio" field)
 * and forwards it to the Transcription Worker via service binding.
 *
 * Returns timestamped transcript segments.
 */
export async function POST(request: NextRequest) {
  const auth = await getRequestAuth();
  if (!auth) return ERRORS.UNAUTHORIZED();

  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (!contentType.includes('multipart/form-data')) {
      return ERRORS.VALIDATION_ERROR(
        'Expected multipart/form-data with an "audio" field',
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return ERRORS.VALIDATION_ERROR('Missing or invalid "audio" field');
    }

    // Validate file size (max 25 MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (audioFile.size > MAX_SIZE) {
      return ERRORS.VALIDATION_ERROR('Audio file exceeds 25 MB limit');
    }

    const env = getEnv();

    if (!env.TRANSCRIPTION_WORKER) {
      return ERRORS.INTERNAL_ERROR('Transcription service not available');
    }

    // Forward to transcription worker via service binding
    const workerFormData = new FormData();
    workerFormData.append('audio', audioFile);

    const workerResponse = await env.TRANSCRIPTION_WORKER.fetch(
      new Request('https://transcription-worker/transcribe', {
        method: 'POST',
        body: workerFormData,
      }),
    );

    if (!workerResponse.ok) {
      console.error(
        '[api/transcribe] Worker error:',
        workerResponse.status,
        await workerResponse.text().catch(() => ''),
      );
      return ERRORS.INTERNAL_ERROR('Transcription service unavailable');
    }

    const result =
      (await workerResponse.json()) as TranscriptionWorkerResponse;

    return NextResponse.json({
      ok: true,
      data: { segments: result.segments },
    });
  } catch (err) {
    console.error('[api/transcribe] Error:', err);
    return ERRORS.INTERNAL_ERROR();
  }
}
