/**
 * Write an NDEF URL record to an NFC badge.
 */

import { isSupported } from './reader';

const ENSEMBLE_BASE_URL = 'https://ensemble.app';

/**
 * Write the user's profile URL to an NFC tag.
 *
 * URL format: https://ensemble.app/c/{congressId}/profile/{userId}
 */
export async function writeTag(userId: string, congressId: string): Promise<void> {
  if (!isSupported()) {
    throw new Error('Web NFC is not supported in this browser.');
  }

  const url = `${ENSEMBLE_BASE_URL}/c/${congressId}/profile/${userId}`;

  const NDEFReaderCtor = (window as unknown as { NDEFReader: new () => NDEFReaderLike }).NDEFReader;
  const writer = new NDEFReaderCtor();

  await writer.write({
    records: [
      {
        recordType: 'url',
        data: url,
      },
    ],
  });
}

// ── Type stubs ────────────────────────────────────────────────

interface NDEFReaderLike {
  write(message: {
    records: Array<{ recordType: string; data: string }>;
  }): Promise<void>;
}
