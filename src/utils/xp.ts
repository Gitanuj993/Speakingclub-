/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExerciseLevel } from '../types';

export const BASE_XP_REWARDS = {
  beginner: 10,
  intermediate: 20,
  advanced: 30,
  interview: 25,
  paceBonus: 5,
};

/**
 * Calculates current level from total accumulated XP.
 * Formula: Level n begins at 100 * (n - 1)^2 XP.
 * Level 1: 0 XP
 * Level 2: 100 XP
 * Level 3: 400 XP
 * Level 4: 900 XP
 * Level 5: 1600 XP
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Returns cumulative XP required to reach a specific level.
 */
export function xpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return 100 * Math.pow(level - 1, 2);
}

/**
 * Calculates progress towards the next level
 */
export function getLevelProgress(xp: number): {
  currentLevel: number;
  nextLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
} {
  const currentLevel = calculateLevel(xp);
  const nextLevel = currentLevel + 1;
  const currentLevelFloor = xpThresholdForLevel(currentLevel);
  const nextLevelFloor = xpThresholdForLevel(nextLevel);

  const xpInCurrentLevel = xp - currentLevelFloor;
  const xpNeededForNextLevel = nextLevelFloor - currentLevelFloor;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
  );

  return {
    currentLevel,
    nextLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}

/**
 * Determines whether an exercise attempt is eligible for XP award today (anti-farming protection)
 */
export function checkExerciseXpEligibility(
  dailyAwardMap: Record<string, string[]>,
  todayKey: string,
  exerciseId: string,
  level: ExerciseLevel
): boolean {
  const key = `${exerciseId}-${level}`;
  const awardedToday = dailyAwardMap[todayKey] || [];
  return !awardedToday.includes(key);
}

/**
 * Determines whether an interview attempt is eligible for XP award today
 */
export function checkInterviewXpEligibility(
  dailyAwardMap: Record<string, string[]>,
  todayKey: string,
  questionId: string
): boolean {
  const awardedToday = dailyAwardMap[todayKey] || [];
  return !awardedToday.includes(questionId);
}
