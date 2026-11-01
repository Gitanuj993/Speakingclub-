/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Flame, Sun, Moon, Award } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FFF9EF]/90 dark:bg-[#201B18]/90 border-b border-[#E8D5B5] dark:border-[#3D352F] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Divine Logo */}
        <Link
          to={data.profile.hasCompletedOnboarding ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E68A24] rounded-lg p-1"
        >
          {/* Lotus / Sun Icon Symbol */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E68A24] via-[#D4AF65] to-[#C66A18] flex items-center justify-center text-white shadow-sm shadow-[#E68A24]/30 border border-[#D4AF65]/40 group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 text-white fill-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stylized Lotus Petal / Sacred Diya Flame */}
              <path d="M12 2C12 2 8 8 8 13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13C16 8 12 2 12 2Z" fill="currentColor" opacity="0.95" />
              <path d="M5.5 13C5.5 10 8 7 8 7C8 7 6.5 11 7.5 14C8 15.5 7.5 17 6.5 17C5.5 17 5.5 14.5 5.5 13Z" fill="currentColor" opacity="0.8" />
              <path d="M18.5 13C18.5 10 16 7 16 7C16 7 17.5 11 16.5 14C16 15.5 16.5 17 17.5 17C18.5 17 18.5 14.5 18.5 13Z" fill="currentColor" opacity="0.8" />
              <path d="M4 19C7 21 17 21 20 19C17 19.5 7 19.5 4 19Z" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#201B18] dark:text-[#FFF9EF] font-serif leading-none">
              SpeakLab
            </span>
            <span className="text-[10px] text-[#C66A18] dark:text-[#D4AF65] font-serif leading-tight tracking-wider uppercase mt-0.5">
              वाक् साधना
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0DF] dark:bg-[#C66A18]/15 border border-[#E68A24]/30 hover:border-[#E68A24]/60 transition-colors"
                title={`${data.streak.current} day streak`}
                aria-label={`Streak: ${data.streak.current} days`}
              >
                <Flame
                  className={`w-4 h-4 ${
                    data.streak.current > 0
                      ? 'text-[#C66A18] fill-[#E68A24]'
                      : 'text-[#6B5E55]'
                  }`}
                />
                <span className="text-xs font-bold text-[#C66A18] dark:text-[#E68A24] font-mono">
                  {data.streak.current}
                </span>
              </Link>

              {/* XP & Level Pill */}
              <Link
                to="/progress"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FBF6EC] dark:bg-[#D4AF65]/15 border border-[#D4AF65]/40 hover:border-[#D4AF65]/70 transition-colors"
                title={`Level ${data.level} (${data.xp} XP)`}
                aria-label={`Level ${data.level}, ${data.xp} XP`}
              >
                <Award className="w-4 h-4 text-[#B08930] dark:text-[#D4AF65]" />
                <span className="text-xs font-bold text-[#B08930] dark:text-[#D4AF65]">
                  Lvl {data.level}
                </span>
                <span className="text-[11px] text-[#B08930]/80 dark:text-[#D4AF65]/80 font-mono hidden sm:inline">
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
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6B5E55] dark:text-[#E8D5B5] hover:bg-[#F5EBDD] dark:hover:bg-[#2A2420] transition-colors border border-transparent hover:border-[#E8D5B5] dark:hover:border-[#3D352F]"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D4AF65]" /> : <Moon className="w-4 h-4 text-[#C66A18]" />}
          </button>

          {isLandingPage && (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center text-xs font-semibold px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#E68A24] to-[#C66A18] hover:from-[#DE7D1C] hover:to-[#B55D12] text-white shadow-sm shadow-[#E68A24]/30 border border-[#D4AF65]/30 transition-all"
            >
              Start Sadhana
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
