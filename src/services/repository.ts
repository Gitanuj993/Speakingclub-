/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  StoredData,
  UserProfile,
  UserSettings,
  ExerciseAttempt,
  InterviewAttempt,
  ExerciseLevel,
} from '../types';
import { getLocalDateString, computeStreakUpdate } from '../utils/dates';
import {
  calculateLevel,
  BASE_XP_REWARDS,
  checkExerciseXpEligibility,
  checkInterviewXpEligibility,
} from '../utils/xp';
import { saveAudioBlob, deleteAudioBlob, clearAllAudioBlobs } from '../utils/idb';

const STORAGE_KEY = 'speaklab_data_v1';
const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  primaryGoal: 'interview-prep',
  proficiency: 'intermediate',
  mainAreaToImprove: 'clarity',
  dailyGoalExercises: 3,
  createdAt: new Date().toISOString(),
  hasCompletedOnboarding: false,
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  transcriptionConsentGiven: null,
  practiceWithoutTranscription: false,
  saveAudioPreference: false,
  playbackSpeed: 1.0,
  skipAheadUnlockAll: true,
};

export const INITIAL_STORED_DATA: StoredData = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  profile: DEFAULT_PROFILE,
  settings: DEFAULT_SETTINGS,
  xp: 0,
  level: 1,
  streak: {
    current: 0,
    longest: 0,
    lastActiveDate: null,
    freezesRemaining: 1,
  },
  completedExercises: {},
  dailyExerciseXpAwarded: {},
  dailyInterviewXpAwarded: {},
  attempts: [],
  interviewAttempts: [],
  unlockedAchievements: [],
};

export interface IRepository {
  getData(): StoredData;
  saveData(data: StoredData): void;
  getProfile(): UserProfile;
  updateProfile(patch: Partial<UserProfile>): UserProfile;
  getSettings(): UserSettings;
  updateSettings(patch: Partial<UserSettings>): UserSettings;
  saveExerciseAttempt(
    attempt: Omit<ExerciseAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
    audioBlob?: Blob
  ): Promise<{ attempt: ExerciseAttempt; xpEarned: number; newLevel: number }>;
  saveInterviewAttempt(
    attempt: Omit<InterviewAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
    audioBlob?: Blob
  ): Promise<{ attempt: InterviewAttempt; xpEarned: number; newLevel: number }>;
  deleteInterviewAttempt(id: string): Promise<void>;
  clearAllInterviewAttempts(): Promise<void>;
  exportData(): string;
  importData(jsonString: string): { success: boolean; error?: string };
  resetAll(): Promise<void>;
}

export class LocalRepository implements IRepository {
  private cache: StoredData;

  constructor() {
    this.cache = this.loadFromStorage();
  }

  private loadFromStorage(): StoredData {
    if (typeof window === 'undefined') {
      return INITIAL_STORED_DATA;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return INITIAL_STORED_DATA;
      }
      const parsed = JSON.parse(raw);
      return this.migrateSchema(parsed);
    } catch (err) {
      console.error('Failed to parse SpeakLab localStorage:', err);
      return INITIAL_STORED_DATA;
    }
  }

  private migrateSchema(data: any): StoredData {
    if (!data || typeof data !== 'object') {
      return INITIAL_STORED_DATA;
    }

    // Version migration path
    const version = data.schemaVersion || 0;
    let migrated = { ...INITIAL_STORED_DATA, ...data };

    if (version < 1) {
      migrated.schemaVersion = 1;
    }

    // Ensure all mandatory structures exist
    migrated.profile = { ...DEFAULT_PROFILE, ...(data.profile || {}) };
    migrated.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
    migrated.streak = {
      ...INITIAL_STORED_DATA.streak,
      ...(data.streak || {}),
    };
    migrated.completedExercises = data.completedExercises || {};
    migrated.dailyExerciseXpAwarded = data.dailyExerciseXpAwarded || {};
    migrated.dailyInterviewXpAwarded = data.dailyInterviewXpAwarded || {};
    migrated.attempts = Array.isArray(data.attempts) ? data.attempts : [];
    migrated.interviewAttempts = Array.isArray(data.interviewAttempts)
      ? data.interviewAttempts
      : [];
    migrated.unlockedAchievements = Array.isArray(data.unlockedAchievements)
      ? data.unlockedAchievements
      : [];
    migrated.xp = typeof data.xp === 'number' ? data.xp : 0;
    migrated.level = calculateLevel(migrated.xp);

    return migrated;
  }

  public getData(): StoredData {
    return { ...this.cache };
  }

  public saveData(data: StoredData): void {
    this.cache = { ...data };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch (err) {
      console.error('Failed to save to localStorage (quota exceeded?):', err);
    }
  }

  public getProfile(): UserProfile {
    return { ...this.cache.profile };
  }

  public updateProfile(patch: Partial<UserProfile>): UserProfile {
    this.cache.profile = { ...this.cache.profile, ...patch };
    this.saveData(this.cache);
    return this.cache.profile;
  }

  public getSettings(): UserSettings {
    return { ...this.cache.settings };
  }

  public updateSettings(patch: Partial<UserSettings>): UserSettings {
    this.cache.settings = { ...this.cache.settings, ...patch };
    this.saveData(this.cache);
    return this.cache.settings;
  }

  public async saveExerciseAttempt(
    attemptData: Omit<ExerciseAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
    audioBlob?: Blob
  ): Promise<{ attempt: ExerciseAttempt; xpEarned: number; newLevel: number }> {
    const today = getLocalDateString();
    const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    let audioBlobId: string | undefined;
    if (audioBlob && this.cache.settings.saveAudioPreference) {
      try {
        audioBlobId = await saveAudioBlob({
          id: `audio_${id}`,
          blob: audioBlob,
          mimeType: audioBlob.type || 'audio/webm',
          durationMs: attemptData.durationMs,
          createdAt: timestamp,
        });
      } catch (err) {
        console.warn('Audio saving failed:', err);
      }
    }

    // Determine XP reward with daily anti-farming
    const isEligibleForXp = checkExerciseXpEligibility(
      this.cache.dailyExerciseXpAwarded,
      today,
      attemptData.exerciseId,
      attemptData.level
    );

    let xpEarned = 0;
    if (isEligibleForXp) {
      xpEarned = BASE_XP_REWARDS[attemptData.level] || 10;
      // Mark as awarded for today
      const existingToday = this.cache.dailyExerciseXpAwarded[today] || [];
      this.cache.dailyExerciseXpAwarded[today] = [
        ...existingToday,
        `${attemptData.exerciseId}-${attemptData.level}`,
      ];
    }

    const fullAttempt: ExerciseAttempt = {
      ...attemptData,
      id,
      timestamp,
      audioBlobId,
      xpAwarded: xpEarned,
    };

    // Update completedExercises records
    const compKey = `${attemptData.exerciseId}-${attemptData.level}`;
    const prev = this.cache.completedExercises[compKey];
    this.cache.completedExercises[compKey] = {
      firstCompletedAt: prev ? prev.firstCompletedAt : timestamp,
      lastPracticedAt: timestamp,
      totalAttempts: (prev?.totalAttempts || 0) + 1,
      bestWpm: Math.max(prev?.bestWpm || 0, attemptData.wpm),
      bestMatchPercent: Math.max(
        prev?.bestMatchPercent || 0,
        attemptData.matchPercent || 0
      ),
    };

    // Update XP and Level
    this.cache.xp += xpEarned;
    this.cache.level = calculateLevel(this.cache.xp);

    // Update Streak
    const streakResult = computeStreakUpdate(
      this.cache.streak.current,
      this.cache.streak.longest,
      this.cache.streak.lastActiveDate,
      this.cache.streak.freezesRemaining,
      today
    );
    this.cache.streak = {
      current: streakResult.current,
      longest: streakResult.longest,
      lastActiveDate: streakResult.lastActiveDate,
      freezesRemaining: streakResult.freezesRemaining,
    };

    // Prepend attempt to history
    this.cache.attempts = [fullAttempt, ...this.cache.attempts].slice(0, 100);

    this.saveData(this.cache);

    return {
      attempt: fullAttempt,
      xpEarned,
      newLevel: this.cache.level,
    };
  }

  public async saveInterviewAttempt(
    attemptData: Omit<InterviewAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
    audioBlob?: Blob
  ): Promise<{ attempt: InterviewAttempt; xpEarned: number; newLevel: number }> {
    const today = getLocalDateString();
    const id = `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    let audioBlobId: string | undefined;
    if (audioBlob && this.cache.settings.saveAudioPreference) {
      try {
        audioBlobId = await saveAudioBlob({
          id: `audio_${id}`,
          blob: audioBlob,
          mimeType: audioBlob.type || 'audio/webm',
          durationMs: attemptData.speakingDurationMs,
          createdAt: timestamp,
        });
      } catch (err) {
        console.warn('Audio saving failed:', err);
      }
    }

    const isEligible = checkInterviewXpEligibility(
      this.cache.dailyInterviewXpAwarded,
      today,
      attemptData.questionId
    );

    let xpEarned = 0;
    if (isEligible) {
      xpEarned = BASE_XP_REWARDS.interview;
      const existing = this.cache.dailyInterviewXpAwarded[today] || [];
      this.cache.dailyInterviewXpAwarded[today] = [
        ...existing,
        attemptData.questionId,
      ];
    }

    const fullAttempt: InterviewAttempt = {
      ...attemptData,
      id,
      timestamp,
      audioBlobId,
      xpAwarded: xpEarned,
    };

    this.cache.xp += xpEarned;
    this.cache.level = calculateLevel(this.cache.xp);

    const streakResult = computeStreakUpdate(
      this.cache.streak.current,
      this.cache.streak.longest,
      this.cache.streak.lastActiveDate,
      this.cache.streak.freezesRemaining,
      today
    );
    this.cache.streak = {
      current: streakResult.current,
      longest: streakResult.longest,
      lastActiveDate: streakResult.lastActiveDate,
      freezesRemaining: streakResult.freezesRemaining,
    };

    this.cache.interviewAttempts = [
      fullAttempt,
      ...this.cache.interviewAttempts,
    ].slice(0, 100);

    this.saveData(this.cache);

    return {
      attempt: fullAttempt,
      xpEarned,
      newLevel: this.cache.level,
    };
  }

  public async deleteInterviewAttempt(id: string): Promise<void> {
    const target = this.cache.interviewAttempts.find((a) => a.id === id);
    if (target?.audioBlobId) {
      await deleteAudioBlob(target.audioBlobId);
    }
    this.cache.interviewAttempts = this.cache.interviewAttempts.filter(
      (a) => a.id !== id
    );
    this.saveData(this.cache);
  }

  public async clearAllInterviewAttempts(): Promise<void> {
    this.cache.interviewAttempts = [];
    this.saveData(this.cache);
  }

  public exportData(): string {
    return JSON.stringify(this.cache, null, 2);
  }

  public importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON file format.' };
      }
      if (typeof parsed.schemaVersion !== 'number') {
        return {
          success: false,
          error: 'Missing schemaVersion in import file. Not a valid SpeakLab backup.',
        };
      }
      const migrated = this.migrateSchema(parsed);
      this.saveData(migrated);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to import: ${err?.message || 'Malformed JSON.'}`,
      };
    }
  }

  public async resetAll(): Promise<void> {
    try {
      await clearAllAudioBlobs();
      localStorage.removeItem(STORAGE_KEY);
      this.cache = { ...INITIAL_STORED_DATA };
    } catch (err) {
      console.error('Reset error:', err);
    }
  }
}

// Singleton repository export
export const repository: IRepository = new LocalRepository();
