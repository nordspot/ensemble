/**
 * Realtime Worker — entry point for the ensemble-realtime service.
 *
 * Routes WebSocket upgrade requests to the appropriate Durable Object:
 *   /ws/ChatRoom/{doId}?token={jwt}
 *   /ws/SessionChannel/{doId}?token={jwt}
 *   /ws/PresenceZone/{doId}?token={jwt}
 *
 * Also exposes a /health endpoint.
 */

export { ChatRoom } from './chat-room';
export { SessionChannel } from './session-channel';
export { PresenceZone } from './presence-zone';

// ── Environment bindings ─────────────────────────────────────

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
  SESSION_CHANNEL: DurableObjectNamespace;
  PRESENCE_ZONE: DurableObjectNamespace;
  JWT_SECRET: string;
}

// ── Simple JWT verification ──────────────────────────────────

interface JWTPayload {
  sub: string;
  name: string;
  role: string;
  exp: number;
  [key: string]: unknown;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const data = encoder.encode(`${parts[0]}.${parts[1]}`);
    // Convert base64url to standard base64
    const sig = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const padded = sig + '='.repeat((4 - (sig.length % 4)) % 4);
    const sigBytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!valid) return null;

    const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr) as JWTPayload;

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ── DO class name -> namespace mapping ───────────────────────

const DO_CLASSES = ['ChatRoom', 'SessionChannel', 'PresenceZone'] as const;
type DOClass = (typeof DO_CLASSES)[number];

function getNamespace(env: Env, className: DOClass): DurableObjectNamespace {
  const map: Record<DOClass, DurableObjectNamespace> = {
    ChatRoom: env.CHAT_ROOM,
    SessionChannel: env.SESSION_CHANNEL,
    PresenceZone: env.PRESENCE_ZONE,
  };
  return map[className];
}

// ── Worker fetch handler ─────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Route: /ws/{doClass}/{doId}
    const match = url.pathname.match(/^\/ws\/(ChatRoom|SessionChannel|PresenceZone)\/([^/]+)$/);
    if (!match) {
      return new Response('Not found. Expected /ws/{doClass}/{doId}', { status: 404 });
    }

    const doClass = match[1] as DOClass;
    const doId = match[2];

    // Validate WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    // Authenticate via token query param
    const token = url.searchParams.get('token');
    if (!token) {
      return new Response('Missing token', { status: 401 });
    }

    const jwtPayload = await verifyJWT(token, env.JWT_SECRET);
    if (!jwtPayload) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    // Get the Durable Object
    const namespace = getNamespace(env, doClass);
    const id = namespace.idFromName(doId);
    const stub = namespace.get(id);

    // Forward the request with user info added as search params
    const doUrl = new URL(request.url);
    doUrl.searchParams.set('userId', jwtPayload.sub);
    doUrl.searchParams.set('userName', jwtPayload.name ?? 'Anonym');
    doUrl.searchParams.set('role', jwtPayload.role ?? 'attendee');

    const doRequest = new Request(doUrl.toString(), {
      headers: request.headers,
    });

    return stub.fetch(doRequest);
  },
};
