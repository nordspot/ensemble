export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    // TODO: Accept audio, run Whisper V3 Turbo, return segments
    return new Response(JSON.stringify({ ok: true, segments: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

interface Env {
  AI: unknown;
}
