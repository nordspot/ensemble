// ChatRoom Durable Object — real-time messaging
// TODO: Implement Hibernatable WebSocket API
export class ChatRoom {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    return new Response('ChatRoom DO — not yet implemented', { status: 501 });
  }
}
