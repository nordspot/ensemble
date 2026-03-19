'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeClient, type RealtimeHandlers } from '@/lib/realtime/client';

interface UseRealtimeOptions {
  /** Called when any message arrives from the server */
  onMessage?: (data: unknown) => void;
  /** Called when connection opens */
  onOpen?: () => void;
  /** Called when connection closes */
  onClose?: () => void;
  /** Called on error */
  onError?: (error: Event) => void;
}

interface UseRealtimeReturn {
  /** Send a message to the Durable Object */
  send: (data: unknown) => void;
  /** Whether the WebSocket is currently open */
  isConnected: boolean;
  /** Force a reconnect (resets attempt counter) */
  reconnect: () => void;
}

const REALTIME_BASE_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_REALTIME_URL ?? '')
    : '';

const AUTH_TOKEN_KEY = 'ensemble_realtime_token';

/**
 * React hook wrapping RealtimeClient.
 *
 * Automatically connects on mount and disconnects on unmount.
 */
export function useRealtime(
  doClass: string,
  doId: string,
  handlers: UseRealtimeOptions = {},
): UseRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<RealtimeClient | null>(null);

  // Stable handler refs to avoid reconnecting on every render
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!doClass || !doId || !REALTIME_BASE_URL) return;

    // Retrieve token from sessionStorage / cookie / etc.
    const token: string =
      typeof window !== 'undefined'
        ? (sessionStorage.getItem(AUTH_TOKEN_KEY) ?? '')
        : '';

    // When doClass is empty, the effect returns early above, so this cast is safe
    const realtimeHandlers: RealtimeHandlers = {
      onMessage: (data) => handlersRef.current.onMessage?.(data),
      onOpen: () => {
        setIsConnected(true);
        handlersRef.current.onOpen?.();
      },
      onClose: () => {
        setIsConnected(false);
        handlersRef.current.onClose?.();
      },
      onError: (err) => handlersRef.current.onError?.(err),
    };

    const client = new RealtimeClient(REALTIME_BASE_URL, token, realtimeHandlers);
    clientRef.current = client;
    client.connect(doClass, doId);

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [doClass, doId]);

  const send = useCallback((data: unknown) => {
    clientRef.current?.send(data);
  }, []);

  const reconnect = useCallback(() => {
    clientRef.current?.forceReconnect();
  }, []);

  return { send, isConnected, reconnect };
}
