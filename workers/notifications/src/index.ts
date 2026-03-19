export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // TODO: Accept notification payload, dispatch via Web Push / email
    const body = await request.json<{ type: string; recipient: string; message: string }>();

    return new Response(
      JSON.stringify({
        ok: true,
        queued: true,
        type: body.type,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};

interface Env {
  // TODO: Add KV/Queue bindings for notification state
}
