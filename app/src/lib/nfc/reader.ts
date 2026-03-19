/**
 * Web NFC API wrapper for reading NDEF tags (badges).
 */

export interface NFCReadResult {
  userId: string;
  profileUrl: string;
}

/**
 * Check whether the Web NFC API is available.
 */
export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

/**
 * Read a single NFC tag and parse the ensemble profile URL.
 *
 * Expected NDEF record: URL of the form
 *   https://ensemble.app/c/{congressId}/profile/{userId}
 *
 * Returns null if the tag does not contain a valid ensemble URL.
 */
export async function readTag(): Promise<NFCReadResult | null> {
  if (!isSupported()) {
    throw new Error('Web NFC is not supported in this browser.');
  }

  const NDEFReaderCtor = (window as unknown as { NDEFReader: new () => NDEFReader }).NDEFReader;
  const reader = new NDEFReaderCtor();

  return new Promise<NFCReadResult | null>((resolve, reject) => {
    const controller = new AbortController();

    reader.addEventListener(
      'reading',
      (event: Event) => {
        const ndefEvent = event as NDEFReadingEvent;
        controller.abort();

        for (const record of ndefEvent.message.records) {
          if (record.recordType === 'url') {
            const decoder = new TextDecoder();
            const url = decoder.decode(record.data);
            const parsed = parseEnsembleUrl(url);
            if (parsed) {
              resolve(parsed);
              return;
            }
          }

          // Also try text records containing a URL
          if (record.recordType === 'text') {
            const decoder = new TextDecoder();
            const text = decoder.decode(record.data);
            const parsed = parseEnsembleUrl(text);
            if (parsed) {
              resolve(parsed);
              return;
            }
          }
        }

        resolve(null);
      },
      { signal: controller.signal },
    );

    reader.addEventListener(
      'readingerror',
      () => {
        controller.abort();
        reject(new Error('Failed to read NFC tag.'));
      },
      { signal: controller.signal },
    );

    reader.scan({ signal: controller.signal }).catch((err: unknown) => {
      reject(err instanceof Error ? err : new Error('NFC permission denied.'));
    });
  });
}

// ── Internal ──────────────────────────────────────────────────

const ENSEMBLE_URL_PATTERN = /\/c\/([^/]+)\/profile\/([^/]+)/;

function parseEnsembleUrl(url: string): NFCReadResult | null {
  const match = ENSEMBLE_URL_PATTERN.exec(url);
  if (!match) return null;
  return {
    userId: match[2],
    profileUrl: url,
  };
}

// ── Type stubs for Web NFC (not yet in lib.dom.d.ts) ──────────

interface NDEFReader extends EventTarget {
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): void;
}

interface NDEFRecord {
  recordType: string;
  data: ArrayBuffer;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
}
