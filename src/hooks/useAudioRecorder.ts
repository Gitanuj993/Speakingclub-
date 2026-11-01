/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { RecorderState } from '../types';

export interface UseAudioRecorderOptions {
  maxDurationSeconds?: number;
  onAutoStop?: () => void;
}

export interface UseAudioRecorderReturn {
  state: RecorderState;
  audioBlob: Blob | null;
  audioUrl: string | null;
  durationMs: number;
  formattedDuration: string;
  errorMessage: string | null;
  isSupported: boolean;
  permissionGranted: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  resetRecording: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {}
): UseAudioRecorderReturn {
  const { maxDurationSeconds = 120, onAutoStop } = options;

  const [state, setState] = useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Check browser support
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setIsSupported(false);
      setErrorMessage(
        'Audio recording is not supported in this browser. Please use a modern browser like Chrome, Edge, or Safari.'
      );
    }
  }, []);

  // Handle visibility change (tab hidden or closed mid-recording)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        stopRecording();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup helper to release microphone tracks & revoke URLs
  const releaseMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
  }, []);

  const cleanupAudioUrl = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseMediaStream();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [releaseMediaStream, audioUrl]);

  // Pick best supported MIME type
  const getSupportedMimeType = (): string => {
    const candidateTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];

    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setState('requesting-permission');
    setErrorMessage(null);

    // Insecure context check (must be HTTPS or localhost)
    if (
      typeof window !== 'undefined' &&
      window.isSecureContext === false &&
      window.location.hostname !== 'localhost'
    ) {
      setState('error');
      setErrorMessage(
        'Microphone access requires a secure HTTPS connection. Please load this page over HTTPS.'
      );
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setPermissionGranted(true);
      setState('ready');
      return true;
    } catch (err: any) {
      setState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Microphone permission was denied. Please allow microphone access in your browser site settings to practice.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage(
          'No microphone was detected on this device. Please connect a microphone or headset.'
        );
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage(
          'Microphone is busy or in use by another application. Please close other voice apps and retry.'
        );
      } else {
        setErrorMessage(
          `Unable to access microphone: ${err.message || 'Unknown device error'}`
        );
      }
      return false;
    }
  }, [isSupported]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    cleanupAudioUrl();
    setAudioBlob(null);
    setDurationMs(0);
    chunksRef.current = [];
    setErrorMessage(null);

    // Ensure we have active stream
    let stream = mediaStreamRef.current;
    if (!stream || stream.getTracks().every((t) => t.readyState === 'ended')) {
      const ok = await requestPermission();
      if (!ok) return false;
      stream = mediaStreamRef.current;
    }

    if (!stream) {
      setState('error');
      setErrorMessage('Audio stream unavailable.');
      return false;
    }

    try {
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);
        setState('stopped');
        releaseMediaStream();
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setState('error');
        setErrorMessage('An error occurred during audio recording.');
        releaseMediaStream();
      };

      recorder.start(250); // Emit slices every 250ms
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setState('recording');

      // Start duration counter
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDurationMs(elapsed);

        // Auto-stop at max duration limit
        if (elapsed >= maxDurationSeconds * 1000) {
          stopRecording();
          if (onAutoStop) onAutoStop();
        }
      }, 100);

      return true;
    } catch (err: any) {
      setState('error');
      setErrorMessage(
        `Failed to start recording: ${err.message || 'MediaRecorder failed'}`
      );
      releaseMediaStream();
      return false;
    }
  }, [
    cleanupAudioUrl,
    maxDurationSeconds,
    onAutoStop,
    releaseMediaStream,
    requestPermission,
  ]);

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      try {
        setState('processing');
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping recorder:', err);
        setState('stopped');
      }
    } else {
      setState('stopped');
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    releaseMediaStream();
    cleanupAudioUrl();
    setAudioBlob(null);
    setDurationMs(0);
    setErrorMessage(null);
    setState('idle');
  }, [cleanupAudioUrl, releaseMediaStream]);

  // Format milliseconds into MM:SS
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return {
    state,
    audioBlob,
    audioUrl,
    durationMs,
    formattedDuration: formatDuration(durationMs),
    errorMessage,
    isSupported,
    permissionGranted,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermission,
  };
}
