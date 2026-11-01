/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Declaration for browser SpeechRecognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  enabled?: boolean;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = 'en-US', enabled = true } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        setIsSupported(true);
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = lang;

          recognition.onstart = () => {
            setIsListening(true);
            setError(null);
          };

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalStr = '';
            let interimStr = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const res = event.results[i];
              if (res.isFinal) {
                finalStr += res[0].transcript + ' ';
              } else {
                interimStr += res[0].transcript;
              }
            }

            if (finalStr) {
              setTranscript((prev) => (prev + ' ' + finalStr).trim());
            }
            setInterimTranscript(interimStr);
          };

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
              // Non-fatal or normal stop
              return;
            }
            console.warn('SpeechRecognition error:', event.error);
            setError(`Speech recognition notice: ${event.error}`);
          };

          recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
          };

          recognitionRef.current = recognition;
        } catch (err: any) {
          setIsSupported(false);
          setError(err?.message || 'Speech recognition initialization failed');
        }
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          manualStopRef.current = true;
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!enabled || !isSupported || !recognitionRef.current) return;
    setError(null);
    manualStopRef.current = false;
    try {
      recognitionRef.current.start();
    } catch (err: any) {
      // Already running or invalid state
      console.warn('Speech recognition start failed:', err);
    }
  }, [enabled, isSupported]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    resetTranscript,
  };
}
