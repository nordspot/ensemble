export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // TODO: Accept text input, generate BGE embeddings, store in Vectorize
    const body = await request.json<{ text: string }>();

    return new Response(
      JSON.stringify({
        ok: true,
        text: body.text,
        vectors: [],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};

interface Env {
  AI: unknown;
  VECTORIZE: VectorizeIndex;
}
