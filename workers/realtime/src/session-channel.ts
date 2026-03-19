// SessionChannel Durable Object — live session state and signaling
// TODO: Implement Hibernatable WebSocket API
export class SessionChannel {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    return new Response('SessionChannel DO — not yet implemented', { status: 501 });
  }
}
