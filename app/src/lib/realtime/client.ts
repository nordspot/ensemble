/**
 * RealtimeClient - WebSocket client for connecting to Durable Object Workers.
 *
 * Supports automatic reconnection with exponential backoff.
 */

export interface RealtimeHandlers {
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private maxReconnect = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;
  private currentDoClass = '';
  private currentDoId = '';

  constructor(
    private baseUrl: string,
    private token: string,
    private handlers: RealtimeHandlers,
  ) {}

  /**
   * Connect to a specific Durable Object instance.
   */
  connect(doClass: string, doId: string): void {
    this.currentDoClass = doClass;
    this.currentDoId = doId;
    this.intentionallyClosed = false;
    this.reconnectAttempt = 0;
    this.openConnection();
  }

  /**
   * Send a message to the connected WebSocket.
   */
  send(data: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[RealtimeClient] Cannot send - WebSocket not open');
      return;
    }
    this.ws.send(JSON.stringify(data));
  }

  /**
   * Gracefully disconnect.
   */
  disconnect(): void {
    this.intentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Get connection status.
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Force a reconnect (resets attempt counter).
   */
  forceReconnect(): void {
    this.reconnectAttempt = 0;
    this.disconnect();
    this.intentionallyClosed = false;
    this.openConnection();
  }

  // ── Internal ──────────────────────────────────────────────

  private openConnection(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const protocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws';
    const host = this.baseUrl.replace(/^https?:\/\//, '');
    const url = `${protocol}://${host}/ws/${this.currentDoClass}/${this.currentDoId}?token=${encodeURIComponent(this.token)}`;

    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      console.error('[RealtimeClient] Failed to create WebSocket:', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.addEventListener('open', () => {
      this.reconnectAttempt = 0;
      this.handlers.onOpen?.();
    });

    this.ws.addEventListener('message', (event) => {
      try {
        const data: unknown = JSON.parse(event.data as string);
        this.handlers.onMessage?.(data);
      } catch {
        // Non-JSON message
        this.handlers.onMessage?.(event.data);
      }
    });

    this.ws.addEventListener('close', () => {
      this.handlers.onClose?.();
      if (!this.intentionallyClosed) {
        this.scheduleReconnect();
      }
    });

    this.ws.addEventListener('error', (event) => {
      this.handlers.onError?.(event);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.maxReconnect) {
      console.warn('[RealtimeClient] Max reconnect attempts reached');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 16_000);
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.openConnection();
    }, delay);
  }
}
