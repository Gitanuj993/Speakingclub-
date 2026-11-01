/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns today's local date string formatted as 'YYYY-MM-DD'
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses 'YYYY-MM-DD' into a local Date object set at local midnight
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Computes calendar day difference (date2 - date1 in whole days)
 * Daylight Saving Time resilient by computing whole midnight days
 */
export function differenceInCalendarDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseLocalDate(dateStr1);
  const d2 = parseLocalDate(dateStr2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
}

/**
 * Formats a timestamp into friendly relative time or standard localized date/time
 */
export function formatFriendlyDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Calculates updated streak state when an activity occurs today
 */
export function computeStreakUpdate(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string | null,
  freezesRemaining: number,
  todayStr: string = getLocalDateString()
): {
  current: number;
  longest: number;
  lastActiveDate: string;
  freezesRemaining: number;
  streakIncremented: boolean;
} {
  if (!lastActiveDate) {
    // First practice ever
    return {
      current: 1,
      longest: Math.max(longestStreak, 1),
      lastActiveDate: todayStr,
      freezesRemaining,
      streakIncremented: true,
    };
  }

  const diff = differenceInCalendarDays(lastActiveDate, todayStr);

  if (diff === 0) {
    // Already practiced today; no streak increment
    return {
      current: currentStreak,
      longest: longestStreak,
      lastActiveDate: todayStr,
      freezesRemaining,
      streakIncremented: false,
    };
  }

  if (diff === 1) {
    // Exactly consecutive day!
    const newCurrent = currentStreak + 1;
    return {
      current: newCurrent,
      longest: Math.max(longestStreak, newCurrent),
      lastActiveDate: todayStr,
      freezesRemaining,
      streakIncremented: true,
    };
  }

  if (diff === 2 && freezesRemaining > 0) {
    // Missed 1 day, but saved by streak freeze
    const newCurrent = currentStreak + 1;
    return {
      current: newCurrent,
      longest: Math.max(longestStreak, newCurrent),
      lastActiveDate: todayStr,
      freezesRemaining: freezesRemaining - 1,
      streakIncremented: true,
    };
  }

  // More than 1 day missed without freeze: streak resets to 1
  return {
    current: 1,
    longest: Math.max(longestStreak, 1),
    lastActiveDate: todayStr,
    freezesRemaining,
    streakIncremented: true,
  };
}
