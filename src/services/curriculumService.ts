/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALPHABET_MODULES } from '../data/alphabetModules';
import { READING_PASSAGES } from '../data/readingPassages';
import { FLUENCY_DRILLS } from '../data/fluencyDrills';
import { TONGUE_TWISTERS } from '../data/tongueTwisters';
import { INTERVIEW_QUESTIONS } from '../data/interviewQuestions';
import {
  Exercise,
  LearningModule,
  InterviewQuestion,
  DailyChallenge,
  StoredData,
  ExerciseLevel,
} from '../types';
import { getLocalDateString } from '../utils/dates';

/**
 * Returns all exercises across all categories
 */
export function getAllExercises(): Exercise[] {
  const alphabetExercises = ALPHABET_MODULES.flatMap((m) => m.exercises);
  return [
    ...alphabetExercises,
    ...TONGUE_TWISTERS,
    ...READING_PASSAGES,
    ...FLUENCY_DRILLS,
  ];
}

/**
 * Finds an exercise by its unique ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return getAllExercises().find((ex) => ex.id === id);
}

/**
 * Returns all alphabet modules
 */
export function getAlphabetModules(): LearningModule[] {
  return ALPHABET_MODULES;
}

/**
 * Returns an alphabet module by its ID (e.g. 'alpha-a')
 */
export function getAlphabetModuleById(id: string): LearningModule | undefined {
  return ALPHABET_MODULES.find((m) => m.id === id);
}

/**
 * Returns all interview questions
 */
export function getInterviewQuestions(): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS;
}

/**
 * Finds an interview question by its unique ID
 */
export function getInterviewQuestionById(id: string): InterviewQuestion | undefined {
  return INTERVIEW_QUESTIONS.find((q) => q.id === id);
}

/**
 * Determines whether an alphabet module is unlocked.
 * All modules are permanently open and accessible.
 */
export function isModuleUnlocked(
  _moduleId: string,
  _storedData: StoredData
): { unlocked: boolean; lockReason?: string } {
  return { unlocked: true };
}

/**
 * Determines whether a specific level within an exercise or module is unlocked.
 * All levels are permanently open and accessible.
 */
export function isLevelUnlocked(
  _moduleId: string,
  _level: ExerciseLevel,
  _storedData: StoredData
): { unlocked: boolean; lockReason?: string } {
  return { unlocked: true };
}

/**
 * Generates a deterministic, date-seeded daily challenge for all users on a given day
 */
export function getDailyChallenge(
  storedData: StoredData,
  todayStr: string = getLocalDateString()
): DailyChallenge {
  // Simple deterministic string hash
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const allExercises = getAllExercises();
  const selectedExercise = allExercises[positiveHash % allExercises.length];

  const targetCount = 2; // Complete 2 repetitions
  const completedKey = `${selectedExercise.id}-${selectedExercise.level}`;
  const record = storedData.completedExercises[completedKey];
  const isCompleted = (record?.totalAttempts || 0) >= targetCount;

  return {
    id: `challenge-${todayStr}`,
    dateKey: todayStr,
    title: `Daily Drill: Master ${selectedExercise.targetSounds[0] || 'Articulation'}`,
    description: `Complete ${targetCount} repetitions of "${selectedExercise.title}" with clear diction.`,
    exerciseId: selectedExercise.id,
    targetCount,
    xpReward: 35,
    completed: isCompleted,
  };
}
