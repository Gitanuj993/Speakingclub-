/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategory = 
  | 'alphabet' 
  | 'tongue-twister' 
  | 'reading' 
  | 'fluency';

export interface ReferenceAudio {
  type: 'tts' | 'file';
  rate: number;
  voiceHint?: string;
  url?: string;
}

export interface Exercise {
  id: string;
  moduleId: string; // e.g. "alpha-a", "reading", "fluency", "twisters"
  category: ExerciseCategory;
  level: ExerciseLevel;
  title: string;
  text: string;
  targetSounds: string[];
  objective: string;
  repetitionsRequired: number;
  targetWpmRange?: [number, number]; // e.g. [110, 140]
  tip: string;
}

export interface LearningModule {
  id: string;
  letter?: string; // For alphabet path: 'A'..'Z'
  name: string;
  category: ExerciseCategory;
  focus: string; // Phonetic focus, e.g., "Bilabial Plosives /b/ vs /p/"
  minimalPairs: Array<[string, string]>; // e.g., ["bat", "pat"], ["big", "pig"]
  articulationTip: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: Exercise[];
}

export interface WordDiff {
  word: string;
  status: 'matched' | 'missing' | 'substituted' | 'extra';
  spokenWord?: string;
}

export interface SpeechResult {
  transcript: string;
  wordAlignment: WordDiff[];
  matchPercent: number; // 0 - 100
  wpm: number;
  durationMs: number;
  fillerWordsFound: Array<{ word: string; count: number }>;
  longPausesDetected?: number;
  phonemeAnalysis: null; // explicitly null to preserve architectural slot without fake scores
}

export type RecorderState = 
  | 'idle' 
  | 'requesting-permission' 
  | 'ready' 
  | 'recording' 
  | 'paused' 
  | 'processing' 
  | 'stopped' 
  | 'error';

export interface SelfReviewData {
  checklist: {
    clearArticulation: boolean;
    controlledPacing: boolean;
    naturalBreathing: boolean;
  };
  rating: number; // 1 to 5
  notes?: string;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  moduleId: string;
  category: ExerciseCategory;
  level: ExerciseLevel;
  timestamp: string; // ISO string
  durationMs: number;
  wpm: number;
  repetitionsCompleted: number;
  matchPercent?: number;
  transcript?: string;
  selfReview?: SelfReviewData;
  audioBlobId?: string; // If stored in IndexedDB
  xpAwarded: number;
}

export type InterviewCategory = 
  | 'personal-intro'
  | 'education-background'
  | 'project-explanation'
  | 'technical-communication'
  | 'behavioral';

export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  categoryLabel: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  prepSeconds: number;
  speakSeconds: number;
  instructions: string;
  framework: string; // e.g. "STAR (Situation, Task, Action, Result)" or "Present-Past-Future"
  frameworkChecklist: string[];
  sampleStructure: string[];
  tags: string[];
}

export interface InterviewAttempt {
  id: string;
  questionId: string;
  category: InterviewCategory;
  questionText: string;
  timestamp: string;
  prepDurationMs: number;
  speakingDurationMs: number;
  wpm: number;
  fillerWordsFound: Array<{ word: string; count: number }>;
  transcript?: string;
  selfNotes?: string;
  frameworkRating?: Record<string, boolean>;
  audioBlobId?: string;
  xpAwarded: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number; // 0 to 1
  maxProgress: number;
  checkUnlocked: (data: StoredData) => boolean;
}

export interface DailyChallenge {
  id: string;
  dateKey: string; // 'YYYY-MM-DD'
  title: string;
  description: string;
  exerciseId: string;
  targetCount: number;
  xpReward: number;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  primaryGoal: 'interview-prep' | 'pronunciation' | 'speaking-fluency' | 'overall-communication';
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  mainAreaToImprove: 'clarity' | 'speed-control' | 'confidence' | 'vocabulary' | 'fillers';
  dailyGoalExercises: number; // default e.g. 3
  createdAt: string;
  hasCompletedOnboarding: boolean;
}

export interface UserSettings {
  theme: 'system' | 'light' | 'dark';
  transcriptionConsentGiven: boolean | null; // null = not yet asked, true = allowed, false = rejected
  practiceWithoutTranscription: boolean;
  saveAudioPreference: boolean; // default false
  playbackSpeed: number; // 0.6 | 0.8 | 1.0
  skipAheadUnlockAll: boolean; // unlock all levels/modules
}

export interface StoredData {
  schemaVersion: number;
  profile: UserProfile;
  settings: UserSettings;
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null; // YYYY-MM-DD
    freezesRemaining: number;
  };
  completedExercises: Record<string, { // key: `${exerciseId}-${level}`
    firstCompletedAt: string;
    lastPracticedAt: string;
    totalAttempts: number;
    bestWpm?: number;
    bestMatchPercent?: number;
  }>;
  dailyExerciseXpAwarded: Record<string, string[]>; // dateKey -> array of `${exerciseId}-${level}`
  dailyInterviewXpAwarded: Record<string, string[]>; // dateKey -> array of questionId
  attempts: ExerciseAttempt[];
  interviewAttempts: InterviewAttempt[];
  unlockedAchievements: string[]; // achievement IDs
}
