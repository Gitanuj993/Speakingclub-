/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateWpm, detectFillerWords, evaluatePace } from './scoring';

describe('Scoring and Communication Analytics', () => {
  it('calculates WPM accurately based on word count and duration', () => {
    // 30 words in 15 seconds (1/4 min) = 120 WPM
    const wpm = calculateWpm(30, 15000);
    expect(wpm).toBe(120);

    // 0 duration returns 0
    expect(calculateWpm(30, 0)).toBe(0);
  });

  it('detects common filler words in transcripts', () => {
    const transcript = "Um, so basically I think, you know, we should uh optimize the database.";
    const fillers = detectFillerWords(transcript);

    const wordsDetected = fillers.map((f) => f.word);
    expect(wordsDetected).toContain('um');
    expect(wordsDetected).toContain('uh');
    expect(wordsDetected).toContain('basically');
    expect(wordsDetected).toContain('you know');
  });

  it('evaluates speaking pace against target ranges', () => {
    const targetRange: [number, number] = [120, 150];

    const optimal = evaluatePace(135, targetRange);
    expect(optimal.status).toBe('optimal');

    const tooSlow = evaluatePace(95, targetRange);
    expect(tooSlow.status).toBe('too-slow');

    const tooFast = evaluatePace(185, targetRange);
    expect(tooFast.status).toBe('too-fast');
  });
});
