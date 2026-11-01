/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Achievement, StoredData } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-recording',
    title: 'First Recording',
    description: 'Complete your first practice recording session in SpeakLab.',
    icon: 'Mic',
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
    checkUnlocked: (data: StoredData) =>
      data.attempts.length > 0 || data.interviewAttempts.length > 0,
  },
  {
    id: 'first-lesson',
    title: 'First Lesson Completed',
    description: 'Successfully complete all repetitions of any exercise lesson.',
    icon: 'CheckCircle2',
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
    checkUnlocked: (data: StoredData) =>
      Object.keys(data.completedExercises).length >= 1,
  },
  {
    id: 'three-day-streak',
    title: 'Consistency Hero',
    description: 'Practice 3 consecutive days without breaking your streak.',
    icon: 'Flame',
    unlockedAt: null,
    progress: 0,
    maxProgress: 3,
    checkUnlocked: (data: StoredData) => data.streak.longest >= 3,
  },
  {
    id: 'seven-day-streak',
    title: '7-Day Streak',
    description: 'Maintain your practice streak for seven consecutive days.',
    icon: 'Zap',
    unlockedAt: null,
    progress: 0,
    maxProgress: 7,
    checkUnlocked: (data: StoredData) => data.streak.longest >= 7,
  },
  {
    id: 'exercises-25',
    title: '25 Exercises Completed',
    description: 'Finish 25 different exercises across any learning category.',
    icon: 'Award',
    unlockedAt: null,
    progress: 0,
    maxProgress: 25,
    checkUnlocked: (data: StoredData) =>
      Object.keys(data.completedExercises).length >= 25,
  },
  {
    id: 'interview-explorer',
    title: 'Interview Explorer',
    description: 'Practice at least one question in every interview category.',
    icon: 'Briefcase',
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
    checkUnlocked: (data: StoredData) => {
      const categoriesFound = new Set(
        data.interviewAttempts.map((att) => att.category)
      );
      return categoriesFound.size >= 5;
    },
  },
  {
    id: 'personal-best',
    title: 'Personal Best',
    description: 'Achieve a match rate of 90% or higher on any exercise.',
    icon: 'Trophy',
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
    checkUnlocked: (data: StoredData) =>
      data.attempts.some((a) => (a.matchPercent || 0) >= 90),
  },
  {
    id: 'speed-master',
    title: 'Speed Master',
    description: 'Achieve over 140 WPM on an Advanced tongue twister.',
    icon: 'Gauge',
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
    checkUnlocked: (data: StoredData) =>
      data.attempts.some(
        (a) => a.level === 'advanced' && a.wpm >= 140
      ),
  },
  {
    id: 'alphabet-explorer',
    title: 'Articulation Ace',
    description: 'Complete exercises in at least 10 different alphabet modules.',
    icon: 'BookOpen',
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
    checkUnlocked: (data: StoredData) => {
      const alphaModules = new Set(
        Object.keys(data.completedExercises)
          .filter((k) => k.startsWith('alpha-'))
          .map((k) => k.split('-')[1])
      );
      return alphaModules.size >= 10;
    },
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Amass 1,000 cumulative XP through steady daily practice.',
    icon: 'Crown',
    unlockedAt: null,
    progress: 0,
    maxProgress: 1000,
    checkUnlocked: (data: StoredData) => data.xp >= 1000,
  },
];
