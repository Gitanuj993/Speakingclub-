/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { differenceInCalendarDays, computeStreakUpdate } from './dates';

describe('Calendar Dates and Streak Integrity', () => {
  it('computes exact whole calendar day differences', () => {
    expect(differenceInCalendarDays('2026-11-01', '2026-11-02')).toBe(1);
    expect(differenceInCalendarDays('2026-11-01', '2026-11-01')).toBe(0);
    expect(differenceInCalendarDays('2026-10-31', '2026-11-01')).toBe(1);
  });

  it('increments streak on consecutive days', () => {
    const update = computeStreakUpdate(3, 5, '2026-11-01', 1, '2026-11-02');
    expect(update.current).toBe(4);
    expect(update.streakIncremented).toBe(true);
  });

  it('does not increment streak on duplicate practice today', () => {
    const update = computeStreakUpdate(3, 5, '2026-11-02', 1, '2026-11-02');
    expect(update.current).toBe(3);
    expect(update.streakIncremented).toBe(false);
  });

  it('preserves streak using freeze if 1 day was missed', () => {
    // Last active 2026-11-01, today 2026-11-03 (diff = 2)
    const update = computeStreakUpdate(4, 4, '2026-11-01', 1, '2026-11-03');
    expect(update.current).toBe(5);
    expect(update.freezesRemaining).toBe(0);
    expect(update.streakIncremented).toBe(true);
  });

  it('resets streak to 1 if more than 1 day missed without freeze', () => {
    const update = computeStreakUpdate(4, 6, '2026-11-01', 0, '2026-11-04');
    expect(update.current).toBe(1);
    expect(update.longest).toBe(6);
  });
});
