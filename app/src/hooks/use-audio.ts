'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ── Types ───────────────────────────────────────────────────

interface UseAudioReturn {
  /** Whether the microphone is currently recording. */
  isRecording: boolean;
  /** Start recording from the user's microphone. */
  startRecording: () => Promise<void>;
  /** Stop recording and release the microphone. */
  stopRecording: () => void;
  /** Accumulated audio chunks (webm/opus blobs) recorded in 5-second intervals. */
  audioChunks: Blob[];
}

interface UseAudioOptions {
  /** Chunk interval in milliseconds (default: 5000 = 5 seconds). */
  chunkInterval?: number;
  /** Called each time a new audio chunk is ready. */
  onChunk?: (chunk: Blob) => void;
}

// ── Hook ────────────────────────────────────────────────────

/**
 * Audio capture hook using the MediaRecorder API.
 *
 * Records in configurable intervals (default 5 seconds) and
 * produces webm/opus blobs suitable for server-side transcription.
 */
export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const { chunkInterval = 5000, onChunk } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Prefer webm/opus; fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
          onChunkRef.current?.(event.data);
        }
      };

      recorder.start(chunkInterval);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('[useAudio] Failed to start recording:', err);
    }
  }, [chunkInterval]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }

    // Release all tracks to free the microphone
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { isRecording, startRecording, stopRecording, audioChunks };
}
