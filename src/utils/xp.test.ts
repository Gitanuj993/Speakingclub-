/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  xpThresholdForLevel,
  getLevelProgress,
  checkExerciseXpEligibility,
} from './xp';

describe('Gamification, XP, and Level Progression', () => {
  it('computes levels deterministically', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(50)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(399)).toBe(2);
    expect(calculateLevel(400)).toBe(3);
    expect(calculateLevel(900)).toBe(4);
  });

  it('calculates level progress percentage', () => {
    // Level 1 threshold 0, Level 2 threshold 100
    const prog50 = getLevelProgress(50);
    expect(prog50.currentLevel).toBe(1);
    expect(prog50.nextLevel).toBe(2);
    expect(prog50.progressPercent).toBe(50);
  });

  it('prevents farming by checking daily exercise eligibility', () => {
    const dailyMap = {
      '2026-11-01': ['alpha-a-beg-beginner'],
    };

    const eligibleFirst = checkExerciseXpEligibility(
      dailyMap,
      '2026-11-01',
      'alpha-b-beg',
      'beginner'
    );
    expect(eligibleFirst).toBe(true);

    const eligibleDuplicate = checkExerciseXpEligibility(
      dailyMap,
      '2026-11-01',
      'alpha-a-beg',
      'beginner'
    );
    expect(eligibleDuplicate).toBe(false);
  });
});
