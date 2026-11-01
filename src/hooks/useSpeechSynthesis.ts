/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  setRate: (rate: number) => void;
  speak: (text: string) => void;
  stop: () => void;
  error: string | null;
}

export function useSpeechSynthesis(initialRate: number = 1.0): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRateState] = useState(initialRate);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);

        // Pick preferred en-* voice
        const enVoice =
          available.find((v) => v.lang.startsWith('en-US') && v.name.includes('Natural')) ||
          available.find((v) => v.lang.startsWith('en-US')) ||
          available.find((v) => v.lang.startsWith('en')) ||
          available[0] ||
          null;

        setSelectedVoice(enVoice);
      };

      updateVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const setRate = useCallback(
    (newRate: number) => {
      setRateState(newRate);
      if (isSpeaking) {
        stop();
      }
    },
    [isSpeaking, stop]
  );

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) {
        setError('Speech synthesis is not supported in this browser.');
        return;
      }

      stop();
      setError(null);

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = 1.0;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (e) => {
          setIsSpeaking(false);
          // Don't flag error if simply canceled
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            setError(`Speech synthesis error: ${e.error}`);
          }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        setIsSpeaking(false);
        setError(err?.message || 'Failed to speak text.');
      }
    },
    [isSupported, rate, selectedVoice, stop]
  );

  return {
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    rate,
    setRate,
    speak,
    stop,
    error,
  };
}
