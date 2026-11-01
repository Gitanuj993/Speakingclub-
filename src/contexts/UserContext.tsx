/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  StoredData,
  UserProfile,
  UserSettings,
  ExerciseAttempt,
  InterviewAttempt,
  Achievement,
} from '../types';
import { repository } from '../services/repository';
import { ACHIEVEMENTS } from '../data/achievements';
import { useToast } from './ToastContext';

interface UserContextType {
  data: StoredData;
  profile: UserProfile;
  settings: UserSettings;
  achievements: Achievement[];
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  saveExerciseAttempt: (
    attempt: Omit<ExerciseAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
    audioBlob?: Blob
  ) => Promise<{ attempt: ExerciseAttempt; xpEarned: number; newLevel: number }>;
  saveInterviewAttempt: (
    attempt: Omit<InterviewAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
    audioBlob?: Blob
  ) => Promise<{ attempt: InterviewAttempt; xpEarned: number; newLevel: number }>;
  deleteInterviewAttempt: (id: string) => Promise<void>;
  clearAllInterviewAttempts: () => Promise<void>;
  exportData: () => string;
  importData: (jsonStr: string) => { success: boolean; error?: string };
  resetAllData: () => Promise<void>;
  refreshData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoredData>(() => repository.getData());
  const { success } = useToast();

  const refreshData = useCallback(() => {
    setData(repository.getData());
  }, []);

  // Sync theme with DOM html class
  useEffect(() => {
    const root = document.documentElement;
    const theme = data.settings.theme;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System default
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [data.settings.theme]);

  // Check achievements after data updates
  const checkAndAwardAchievements = useCallback(
    (currentData: StoredData) => {
      const alreadyUnlocked = new Set(currentData.unlockedAchievements);
      const newlyUnlocked: string[] = [];

      for (const ach of ACHIEVEMENTS) {
        if (!alreadyUnlocked.has(ach.id)) {
          if (ach.checkUnlocked(currentData)) {
            newlyUnlocked.push(ach.id);
          }
        }
      }

      if (newlyUnlocked.length > 0) {
        const updatedAchievements = [...currentData.unlockedAchievements, ...newlyUnlocked];
        const updatedData = { ...currentData, unlockedAchievements: updatedAchievements };
        repository.saveData(updatedData);
        setData(updatedData);

        for (const id of newlyUnlocked) {
          const ach = ACHIEVEMENTS.find((a) => a.id === id);
          if (ach) {
            success('Achievement Unlocked!', `${ach.title} — ${ach.description}`);
          }
        }
      }
    },
    [success]
  );

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      repository.updateProfile(patch);
      refreshData();
    },
    [refreshData]
  );

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      repository.updateSettings(patch);
      refreshData();
    },
    [refreshData]
  );

  const saveExerciseAttempt = useCallback(
    async (
      attempt: Omit<ExerciseAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
      audioBlob?: Blob
    ) => {
      const result = await repository.saveExerciseAttempt(attempt, audioBlob);
      const fresh = repository.getData();
      setData(fresh);
      checkAndAwardAchievements(fresh);
      return result;
    },
    [checkAndAwardAchievements]
  );

  const saveInterviewAttempt = useCallback(
    async (
      attempt: Omit<InterviewAttempt, 'id' | 'timestamp' | 'xpAwarded'>,
      audioBlob?: Blob
    ) => {
      const result = await repository.saveInterviewAttempt(attempt, audioBlob);
      const fresh = repository.getData();
      setData(fresh);
      checkAndAwardAchievements(fresh);
      return result;
    },
    [checkAndAwardAchievements]
  );

  const deleteInterviewAttempt = useCallback(
    async (id: string) => {
      await repository.deleteInterviewAttempt(id);
      refreshData();
    },
    [refreshData]
  );

  const clearAllInterviewAttempts = useCallback(async () => {
    await repository.clearAllInterviewAttempts();
    refreshData();
  }, [refreshData]);

  const exportData = useCallback(() => {
    return repository.exportData();
  }, []);

  const importData = useCallback(
    (jsonStr: string) => {
      const res = repository.importData(jsonStr);
      if (res.success) {
        refreshData();
      }
      return res;
    },
    [refreshData]
  );

  const resetAllData = useCallback(async () => {
    await repository.resetAll();
    refreshData();
  }, [refreshData]);

  // Compute achievements with runtime progress
  const computedAchievements: Achievement[] = ACHIEVEMENTS.map((ach) => {
    const isUnlocked = data.unlockedAchievements.includes(ach.id);
    let progress = 0;

    if (ach.id === 'first-recording') {
      progress = data.attempts.length + data.interviewAttempts.length > 0 ? 1 : 0;
    } else if (ach.id === 'first-lesson') {
      progress = Object.keys(data.completedExercises).length > 0 ? 1 : 0;
    } else if (ach.id === 'three-day-streak') {
      progress = Math.min(3, data.streak.longest);
    } else if (ach.id === 'seven-day-streak') {
      progress = Math.min(7, data.streak.longest);
    } else if (ach.id === 'exercises-25') {
      progress = Math.min(25, Object.keys(data.completedExercises).length);
    } else if (ach.id === 'interview-explorer') {
      const cats = new Set(data.interviewAttempts.map((a) => a.category));
      progress = Math.min(5, cats.size);
    } else if (ach.id === 'century-club') {
      progress = Math.min(1000, data.xp);
    } else {
      progress = isUnlocked ? ach.maxProgress : 0;
    }

    return {
      ...ach,
      unlockedAt: isUnlocked ? 'Unlocked' : null,
      progress,
    };
  });

  return (
    <UserContext.Provider
      value={{
        data,
        profile: data.profile,
        settings: data.settings,
        achievements: computedAchievements,
        updateProfile,
        updateSettings,
        saveExerciseAttempt,
        saveInterviewAttempt,
        deleteInterviewAttempt,
        clearAllInterviewAttempts,
        exportData,
        importData,
        resetAllData,
        refreshData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
