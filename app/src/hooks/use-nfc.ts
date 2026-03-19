'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { isSupported, readTag, type NFCReadResult } from '@/lib/nfc/reader';
import { writeTag } from '@/lib/nfc/writer';

export interface UseNFCReturn {
  isSupported: boolean;
  isReading: boolean;
  readTag: () => Promise<NFCReadResult | null>;
  writeTag: (userId: string, congressId: string) => Promise<void>;
  lastRead: NFCReadResult | null;
  error: string | null;
}

/**
 * React hook for Web NFC reading and writing.
 */
export function useNFC(): UseNFCReturn {
  const [isReading, setIsReading] = useState(false);
  const [lastRead, setLastRead] = useState<NFCReadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleRead = useCallback(async (): Promise<NFCReadResult | null> => {
    setError(null);
    setIsReading(true);

    try {
      const result = await readTag();
      if (mountedRef.current) {
        setLastRead(result);
        setIsReading(false);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        const message =
          err instanceof Error ? err.message : 'NFC-Lesefehler';
        setError(message);
        setIsReading(false);
      }
      return null;
    }
  }, []);

  const handleWrite = useCallback(async (userId: string, congressId: string): Promise<void> => {
    setError(null);
    try {
      await writeTag(userId, congressId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'NFC-Schreibfehler';
      if (mountedRef.current) {
        setError(message);
      }
      throw err;
    }
  }, []);

  return {
    isSupported: typeof window !== 'undefined' && isSupported(),
    isReading,
    readTag: handleRead,
    writeTag: handleWrite,
    lastRead,
    error,
  };
}
