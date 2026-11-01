/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { ALPHABET_MODULES } from './alphabetModules';
import { READING_PASSAGES } from './readingPassages';
import { FLUENCY_DRILLS } from './fluencyDrills';
import { TONGUE_TWISTERS } from './tongueTwisters';
import { INTERVIEW_QUESTIONS } from './interviewQuestions';
import { ACHIEVEMENTS } from './achievements';

describe('Curriculum Content Integrity & Validation', () => {
  it('contains all 26 alphabet modules with complete metadata', () => {
    expect(ALPHABET_MODULES.length).toBe(26);

    const letters = ALPHABET_MODULES.map((m) => m.letter);
    const expectedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(letters).toEqual(expectedLetters);

    for (const mod of ALPHABET_MODULES) {
      expect(mod.focus).toBeTruthy();
      expect(mod.articulationTip).toBeTruthy();
      expect(mod.minimalPairs.length).toBeGreaterThanOrEqual(2);
      expect(mod.exercises.length).toBe(3);

      const levels = mod.exercises.map((e) => e.level);
      expect(levels).toEqual(['beginner', 'intermediate', 'advanced']);
    }
  });

  it('contains at least 78 unique alphabet exercises', () => {
    const allAlphabetExercises = ALPHABET_MODULES.flatMap((m) => m.exercises);
    expect(allAlphabetExercises.length).toBeGreaterThanOrEqual(78);

    const ids = allAlphabetExercises.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(allAlphabetExercises.length);

    for (const ex of allAlphabetExercises) {
      expect(ex.title).toBeTruthy();
      expect(ex.text).toBeTruthy();
      expect(ex.targetSounds.length).toBeGreaterThan(0);
      expect(ex.repetitionsRequired).toBeGreaterThanOrEqual(1);
    }
  });

  it('contains at least 12 reading passages', () => {
    expect(READING_PASSAGES.length).toBeGreaterThanOrEqual(12);
    for (const p of READING_PASSAGES) {
      expect(p.title).toBeTruthy();
      expect(p.text.length).toBeGreaterThan(50);
      expect(p.targetWpmRange).toBeDefined();
    }
  });

  it('contains at least 12 fluency drills', () => {
    expect(FLUENCY_DRILLS.length).toBeGreaterThanOrEqual(12);
    for (const f of FLUENCY_DRILLS) {
      expect(f.title).toBeTruthy();
      expect(f.text).toBeTruthy();
      expect(f.objective).toBeTruthy();
    }
  });

  it('contains at least 30 interview questions across 5 categories', () => {
    expect(INTERVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(30);

    const categories = [
      'personal-intro',
      'education-background',
      'project-explanation',
      'technical-communication',
      'behavioral',
    ];

    for (const cat of categories) {
      const inCategory = INTERVIEW_QUESTIONS.filter((q) => q.category === cat);
      expect(inCategory.length).toBeGreaterThanOrEqual(5);
    }

    const ids = INTERVIEW_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(INTERVIEW_QUESTIONS.length);

    for (const q of INTERVIEW_QUESTIONS) {
      expect(q.prepSeconds).toBeGreaterThan(0);
      expect(q.speakSeconds).toBeGreaterThan(0);
      expect(q.framework).toBeTruthy();
      expect(q.frameworkChecklist.length).toBeGreaterThanOrEqual(2);
      expect(q.sampleStructure.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('contains at least 10 data-driven achievements', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    for (const ach of ACHIEVEMENTS) {
      expect(ach.id).toBeTruthy();
      expect(ach.title).toBeTruthy();
      expect(ach.description).toBeTruthy();
      expect(typeof ach.checkUnlocked).toBe('function');
    }
  });
});
