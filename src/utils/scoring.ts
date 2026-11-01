/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordDiff } from '../types';

export const COMMON_FILLER_WORDS = [
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you know',
  'basically',
  'actually',
  'literally',
  'sort of',
  'kind of',
  'i mean',
  'right',
];

/**
 * Calculates Words Per Minute (WPM) based on expected word count and duration in milliseconds
 */
export function calculateWpm(wordCount: number, durationMs: number): number {
  if (durationMs <= 0 || wordCount <= 0) return 0;
  const minutes = durationMs / 60000;
  return Math.round(wordCount / minutes);
}

/**
 * Counts filler words present in the spoken transcript
 */
export function detectFillerWords(
  transcript: string
): Array<{ word: string; count: number }> {
  if (!transcript) return [];
  const lower = transcript.toLowerCase();
  const results: Array<{ word: string; count: number }> = [];

  for (const filler of COMMON_FILLER_WORDS) {
    let count = 0;
    if (filler.includes(' ')) {
      // Phrase matching
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      count = matches ? matches.length : 0;
    } else {
      // Single word matching
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      count = matches ? matches.length : 0;
    }

    if (count > 0) {
      results.push({ word: filler, count });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

export type PaceStatus = 'too-slow' | 'optimal' | 'too-fast' | 'unspecified';

/**
 * Evaluates whether speaking pace falls within the targeted range
 */
export function evaluatePace(
  wpm: number,
  targetWpmRange?: [number, number]
): {
  status: PaceStatus;
  label: string;
  advice: string;
} {
  if (!targetWpmRange || targetWpmRange[0] === 0) {
    if (wpm < 100) {
      return {
        status: 'too-slow',
        label: 'Deliberate / Slow Pace',
        advice: 'Try to connect words into continuous thought units rather than isolated words.',
      };
    }
    if (wpm > 175) {
      return {
        status: 'too-fast',
        label: 'Rapid Pace',
        advice: 'Slow down slightly to let final consonants and vowels resonate clearly.',
      };
    }
    return {
      status: 'optimal',
      label: 'Natural Speaking Pace',
      advice: 'Your pace is clear, engaging, and easy to follow.',
    };
  }

  const [minWpm, maxWpm] = targetWpmRange;
  if (wpm < minWpm) {
    return {
      status: 'too-slow',
      label: `Below Target (${wpm} vs ${minWpm}-${maxWpm} WPM)`,
      advice: `Aim to build rhythm. Practice linking word endings into the next word.`,
    };
  }
  if (wpm > maxWpm) {
    return {
      status: 'too-fast',
      label: `Above Target (${wpm} vs ${minWpm}-${maxWpm} WPM)`,
      advice: `Speed often degrades articulation of tricky consonant clusters. Prioritize precision over speed.`,
    };
  }

  return {
    status: 'optimal',
    label: `Target Achieved (${wpm} WPM)`,
    advice: `Excellent control. You maintained target speed without sacrificing word endings.`,
  };
}

/**
 * Generates rule-based practice suggestions from actual measurable performance
 */
export function generatePracticeSuggestions(
  diff: WordDiff[],
  targetSounds: string[],
  wpm: number,
  targetWpmRange?: [number, number]
): string[] {
  const suggestions: string[] = [];

  const missedWords = diff
    .filter((d) => d.status === 'missing' || d.status === 'substituted')
    .map((d) => d.word);

  if (missedWords.length > 0) {
    const uniqueMissed = Array.from(new Set(missedWords)).slice(0, 3);
    suggestions.push(
      `Focus on crisp delivery of: "${uniqueMissed.join('", "')}". Break them into syllables if needed.`
    );
  }

  if (targetSounds && targetSounds.length > 0) {
    suggestions.push(
      `Target phoneme reminder: Keep tongue and lip positions distinct for ${targetSounds.join(', ')}.`
    );
  }

  if (targetWpmRange) {
    const pace = evaluatePace(wpm, targetWpmRange);
    if (pace.status !== 'optimal') {
      suggestions.push(pace.advice);
    }
  }

  suggestions.push(
    'Ensure you breathe from your diaphragm at natural punctuation pauses rather than mid-clause.'
  );

  return suggestions;
}
