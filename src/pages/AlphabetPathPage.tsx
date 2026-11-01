/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { getAlphabetModules } from '../services/curriculumService';
import { CheckCircle2, Sparkles } from 'lucide-react';

export const AlphabetPathPage: React.FC = () => {
  const { data } = useUser();
  const modules = getAlphabetModules();

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/learn" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Learning Hub
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Badge variant="primary" size="sm">A to Z Path</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
            26-Letter Phonetic Path
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            All 26 letter modules and levels are fully unlocked. Practice any sound or difficulty freely.
          </p>
        </div>

        <Badge variant="success" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
          All Modules & Levels Unlocked
        </Badge>
      </div>

      {/* Responsive Grid of 26 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          // Calculate module completion %
          const completedLevels = mod.exercises.filter(
            (ex) => data.completedExercises[`${ex.id}-${ex.level}`]
          ).length;
          const percent = Math.round((completedLevels / mod.exercises.length) * 100);

          return (
            <Card
              key={mod.id}
              padding="md"
              className="flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/60 shadow-xs transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-lg font-mono bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                      {mod.letter}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {mod.name}
                      </h3>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium line-clamp-1">
                        {mod.focus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Minimal Pairs Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {mod.minimalPairs.slice(0, 3).map(([p1, p2], idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                    >
                      {p1} / {p2}
                    </span>
                  ))}
                </div>
              </div>

              {/* Levels Selector (All unlocked) */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Module Progress</span>
                  <span className="font-mono">{completedLevels} of 3 Levels</span>
                </div>
                <ProgressBar value={percent} size="sm" color="indigo" />

                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  {mod.exercises.map((ex) => {
                    const isExCompleted = Boolean(
                      data.completedExercises[`${ex.id}-${ex.level}`]
                    );

                    return (
                      <Link
                        key={ex.id}
                        to={`/lesson/${ex.id}`}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all min-h-[36px] ${
                          isExCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        {isExCompleted && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        )}
                        <span className="capitalize">{ex.level.slice(0, 3)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
