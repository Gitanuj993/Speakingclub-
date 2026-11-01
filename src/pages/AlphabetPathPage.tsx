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
import { CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';

export const AlphabetPathPage: React.FC = () => {
  const { data } = useUser();
  const modules = getAlphabetModules();

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/learn" className="text-xs font-serif text-[#C66A18] dark:text-[#E68A24] hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ज्ञान मार्ग (Learning Hub)</span>
            </Link>
            <span className="text-[#D4AF65]">•</span>
            <Badge variant="gold" size="sm">वर्णमाला साधना • A to Z</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] tracking-tight mt-1.5">
            26-Letter Phonetic Path
          </h1>
          <p className="text-xs sm:text-sm text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-1 max-w-2xl">
            All 26 sacred letter modules and levels are unlocked. Target specific consonant articulations, vowels, and minimal pair contrasts freely.
          </p>
        </div>

        <Badge variant="success" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
          All 26 Modules & Levels Unlocked
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
              className="flex flex-col justify-between border border-[#E8D5B5] dark:border-[#3D352F] hover:border-[#D4AF65] dark:hover:border-[#D4AF65] shadow-xs transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-extrabold text-xl bg-gradient-to-br from-[#E68A24] to-[#C66A18] text-white shadow-sm shadow-[#C66A18]/25 border border-[#D4AF65]">
                      {mod.letter}
                    </div>
                    <div>
                      <h3 className="text-sm font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                        {mod.name}
                      </h3>
                      <p className="text-[11px] text-[#C66A18] dark:text-[#E68A24] font-medium line-clamp-1">
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
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5EBDD] dark:bg-[#28211D] text-[#722F37] dark:text-[#E8D5B5] border border-[#E8D5B5]/60 dark:border-[#3D352F]"
                    >
                      {p1} / {p2}
                    </span>
                  ))}
                </div>
              </div>

              {/* Levels Selector (All unlocked) */}
              <div className="mt-5 pt-3.5 border-t border-[#E8D5B5]/60 dark:border-[#3D352F] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#722F37] dark:text-[#E8D5B5] mb-1">
                  <span className="font-serif">Module Progress</span>
                  <span className="font-mono">{completedLevels} of 3 Levels</span>
                </div>
                <ProgressBar value={percent} size="sm" color="kesari" />

                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  {mod.exercises.map((ex) => {
                    const isExCompleted = Boolean(
                      data.completedExercises[`${ex.id}-${ex.level}`]
                    );

                    return (
                      <Link
                        key={ex.id}
                        to={`/lesson/${ex.id}`}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-serif font-semibold transition-all min-h-[36px] ${
                          isExCompleted
                            ? 'bg-[#77764B]/15 text-[#77764B] dark:text-[#D4AF65] border border-[#77764B]/40'
                            : 'bg-white dark:bg-[#28211D] text-[#201B18] dark:text-[#FFF9EF] border border-[#E8D5B5] dark:border-[#3D352F] hover:border-[#D4AF65] hover:text-[#C66A18] dark:hover:text-[#E68A24]'
                        }`}
                      >
                        {isExCompleted && (
                          <CheckCircle2 className="w-3 h-3 text-[#77764B] dark:text-[#D4AF65] shrink-0" />
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
