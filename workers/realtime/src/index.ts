// Ensemble Realtime Worker — Durable Objects for chat, sessions, presence
// Deployed separately from the Next.js app

export { ChatRoom } from './chat-room';
export { SessionChannel } from './session-channel';
export { PresenceZone } from './presence-zone';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // WebSocket upgrade routing handled by DO classes
    return new Response('Ensemble Realtime Worker', { status: 200 });
  },
};

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
  SESSION_CHANNEL: DurableObjectNamespace;
  PRESENCE_ZONE: DurableObjectNamespace;
}
