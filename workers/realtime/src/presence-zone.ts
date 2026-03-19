// PresenceZone Durable Object — user presence and online status
// TODO: Implement Hibernatable WebSocket API
export class PresenceZone {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    return new Response('PresenceZone DO — not yet implemented', { status: 501 });
  }
}
