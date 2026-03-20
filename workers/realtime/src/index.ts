// Ensemble Realtime Worker — Durable Objects for chat, sessions, presence
// Deployed separately from the Next.js app

export { ChatRoom } from './chat-room';
export { SessionChannel } from './session-channel';
export { PresenceZone } from './presence-zone';

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
  SESSION_CHANNEL: DurableObjectNamespace;
  PRESENCE_ZONE: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // Route: /ws/chat/{roomId}
    const chatMatch = url.pathname.match(/^\/ws\/chat\/([^/]+)$/);
    if (chatMatch) {
      const roomId = chatMatch[1];
      const id = env.CHAT_ROOM.idFromName(roomId);
      const stub = env.CHAT_ROOM.get(id);
      return stub.fetch(request);
    }

    // Route: /ws/session/{sessionId}
    const sessionMatch = url.pathname.match(/^\/ws\/session\/([^/]+)$/);
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      const id = env.SESSION_CHANNEL.idFromName(sessionId);
      const stub = env.SESSION_CHANNEL.get(id);
      return stub.fetch(request);
    }

    // Route: /ws/presence/{zoneId}
    const presenceMatch = url.pathname.match(/^\/ws\/presence\/([^/]+)$/);
    if (presenceMatch) {
      const zoneId = presenceMatch[1];
      const id = env.PRESENCE_ZONE.idFromName(zoneId);
      const stub = env.PRESENCE_ZONE.get(id);
      return stub.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
