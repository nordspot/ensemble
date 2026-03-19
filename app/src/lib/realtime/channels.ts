/**
 * Channel naming helpers for Durable Object IDs.
 *
 * Each function returns a deterministic string ID that maps
 * to a single Durable Object instance via idFromName().
 */

/**
 * Chat channel for a congress conversation.
 * @param congressId - Congress ID
 * @param channelId  - Conversation / channel ID
 */
export function chatChannel(congressId: string, channelId: string): string {
  return `chat:${congressId}:${channelId}`;
}

/**
 * Session interaction channel (Q&A, polls, reactions, transcript).
 * @param congressId - Congress ID
 * @param sessionId  - Session ID
 */
export function sessionChannel(congressId: string, sessionId: string): string {
  return `session:${congressId}:${sessionId}`;
}

/**
 * Presence zone for an entire congress (lobby / venue).
 * @param congressId - Congress ID
 */
export function presenceChannel(congressId: string): string {
  return `presence:${congressId}`;
}
