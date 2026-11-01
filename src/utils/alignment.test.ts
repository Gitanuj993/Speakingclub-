/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { normalizeText, tokenizeWords, alignWords } from './alignment';

describe('Text Normalization and Alignment', () => {
  it('normalizes text by stripping punctuation and lowercasing', () => {
    const raw = "Hello, World! It's a test... don't panic.";
    const normalized = normalizeText(raw);
    expect(normalized).toBe("hello world it's a test don't panic");
  });

  it('tokenizes into individual clean words', () => {
    const tokens = tokenizeWords("  Quick   brown fox  ");
    expect(tokens).toEqual(['quick', 'brown', 'fox']);
  });

  it('accurately computes 100% match on exact spoken transcripts', () => {
    const expected = "Red lorry, yellow lorry.";
    const recognized = "red lorry yellow lorry";
    const result = alignWords(expected, recognized);

    expect(result.matchPercent).toBe(100);
    expect(result.diff.every((d) => d.status === 'matched')).toBe(true);
  });

  it('correctly flags missing and substituted words', () => {
    const expected = "Bright brave builders build bridges.";
    const recognized = "bright builders build roads";
    const result = alignWords(expected, recognized);

    expect(result.matchPercent).toBeLessThan(100);
    expect(result.diff.some((d) => d.status === 'missing' && d.word === 'brave')).toBe(true);
  });
});
