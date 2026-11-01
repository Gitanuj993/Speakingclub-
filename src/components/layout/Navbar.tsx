/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Flame, Zap, Sun, Moon, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, updateSettings } = useUser();
  const location = useLocation();

  const isDark =
    data.settings.theme === 'dark' ||
    (data.settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const isLandingPage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={data.profile.hasCompletedOnboarding ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30 group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
              SpeakLab
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-tight tracking-wider uppercase">
              Club
            </span>
          </div>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {!isLandingPage && (
            <>
              {/* Streak Pill */}
              <Link
                to="/progress"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50 hover:bg-amber-100/60 transition-colors"
                title={`${data.streak.current} day streak`}
                aria-label={`Streak: ${data.streak.current} days`}
              >
                <Flame
                  className={`w-4 h-4 ${
                    data.streak.current > 0
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono">
                  {data.streak.current}
                </span>
              </Link>

              {/* XP & Level Pill */}
              <Link
                to="/progress"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/50 hover:bg-indigo-100/60 transition-colors"
                title={`Level ${data.level} (${data.xp} XP)`}
                aria-label={`Level ${data.level}, ${data.xp} XP`}
              >
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" />
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Lvl {data.level}
                </span>
                <span className="text-[11px] text-indigo-600/70 dark:text-indigo-400/70 font-mono hidden sm:inline">
                  {data.xp} XP
                </span>
              </Link>
            </>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isLandingPage && (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              Start Practicing
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
