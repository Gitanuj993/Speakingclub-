/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordDiff } from '../types';

/**
 * Normalizes input text by:
 * - Converting to lowercase
 * - Removing punctuation (preserving apostrophes within words like don't, it's)
 * - Normalizing whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into normalized tokens
 */
export function tokenizeWords(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(/\s+/).filter(Boolean);
}

/**
 * Word-level alignment using Needleman-Wunsch / Levenshtein dynamic programming.
 * Accurately aligns expected spoken words with recognized transcript words.
 */
export function alignWords(expectedText: string, recognizedText: string): {
  diff: WordDiff[];
  matchedCount: number;
  expectedCount: number;
  matchPercent: number;
} {
  const expected = tokenizeWords(expectedText);
  const recognized = tokenizeWords(recognizedText);

  if (expected.length === 0) {
    return {
      diff: recognized.map((word) => ({ word, status: 'extra' })),
      matchedCount: 0,
      expectedCount: 0,
      matchPercent: recognized.length === 0 ? 100 : 0,
    };
  }

  if (recognized.length === 0) {
    return {
      diff: expected.map((word) => ({ word, status: 'missing' })),
      matchedCount: 0,
      expectedCount: expected.length,
      matchPercent: 0,
    };
  }

  const n = expected.length;
  const m = recognized.length;

  // Cost matrix: dp[i][j]
  // Insertion / deletion cost = 1
  // Match cost = 0 (identical) or Levenshtein distance between words normalized
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0)
  );

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const isExact = expected[i - 1] === recognized[j - 1];
      const matchCost = isExact ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // missing expected
        dp[i][j - 1] + 1, // extra recognized
        dp[i - 1][j - 1] + matchCost // match or substitution
      );
    }
  }

  // Backtrack to find aligned operations
  let i = n;
  let j = m;
  const reversedDiff: WordDiff[] = [];
  let matchedCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const isExact = expected[i - 1] === recognized[j - 1];
      const matchCost = isExact ? 0 : 1;

      if (dp[i][j] === dp[i - 1][j - 1] + matchCost) {
        if (isExact) {
          reversedDiff.push({ word: expected[i - 1], status: 'matched' });
          matchedCount++;
        } else {
          reversedDiff.push({
            word: expected[i - 1],
            status: 'substituted',
            spokenWord: recognized[j - 1],
          });
        }
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      reversedDiff.push({ word: expected[i - 1], status: 'missing' });
      i--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      reversedDiff.push({ word: recognized[j - 1], status: 'extra' });
      j--;
    } else {
      // Fallback
      if (i > 0) i--;
      if (j > 0) j--;
    }
  }

  const diff = reversedDiff.reverse();
  const matchPercent = Math.round((matchedCount / expected.length) * 100);

  return {
    diff,
    matchedCount,
    expectedCount: expected.length,
    matchPercent: Math.min(100, Math.max(0, matchPercent)),
  };
}
