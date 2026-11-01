/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { getLocalDateString, parseLocalDate, formatFriendlyDate } from '../utils/dates';
import {
  BarChart3,
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  Trophy,
  Table,
  LineChart,
  Award,
  Layers,
  Sparkles,
  Briefcase,
  Lock,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { data, achievements } = useUser();
  const [showDataTable, setShowDataTable] = useState(false);

  // Total Practice Time
  const totalPracticeTimeSeconds = useMemo(() => {
    const exerciseTime = data.attempts.reduce((acc, a) => acc + (a.durationMs || 0), 0) / 1000;
    const interviewTime = data.interviewAttempts.reduce(
      (acc, a) => acc + (a.speakingDurationMs || 0),
      0
    ) / 1000;
    return Math.round(exerciseTime + interviewTime);
  }, [data.attempts, data.interviewAttempts]);

  // Last 7 days activity distribution
  const last7DaysData = useMemo(() => {
    const today = new Date();
    const days: Array<{ dateStr: string; label: string; count: number; minutes: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

      // Count attempts on this day
      const exAttempts = data.attempts.filter((a) => a.timestamp.startsWith(dateStr));
      const intAttempts = data.interviewAttempts.filter((a) => a.timestamp.startsWith(dateStr));

      const totalMs =
        exAttempts.reduce((sum, a) => sum + (a.durationMs || 0), 0) +
        intAttempts.reduce((sum, a) => sum + (a.speakingDurationMs || 0), 0);

      days.push({
        dateStr,
        label: dayLabel,
        count: exAttempts.length + intAttempts.length,
        minutes: Math.round((totalMs / 60000) * 10) / 10,
      });
    }

    return days;
  }, [data.attempts, data.interviewAttempts]);

  const maxDayCount = Math.max(1, ...last7DaysData.map((d) => d.count));

  // Average WPM from recent attempts
  const averageWpm = useMemo(() => {
    if (data.attempts.length === 0) return 0;
    const sum = data.attempts.reduce((acc, a) => acc + (a.wpm || 0), 0);
    return Math.round(sum / data.attempts.length);
  }, [data.attempts]);

  // Average Match %
  const averageMatchPercent = useMemo(() => {
    const withMatch = data.attempts.filter((a) => typeof a.matchPercent === 'number');
    if (withMatch.length === 0) return null;
    const sum = withMatch.reduce((acc, a) => acc + (a.matchPercent || 0), 0);
    return Math.round(sum / withMatch.length);
  }, [data.attempts]);

  const totalExercisesCompleted = Object.keys(data.completedExercises).length;
  const hasEnoughData = data.attempts.length >= 3;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">साधना प्रगति • Real Vocal Analytics</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] tracking-tight mt-1">
            Speaking Progress & Data Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-1">
            Grounded directly in stored audio attempts and measurable timing data. Zero fabricated metrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDataTable((prev) => !prev)}
          icon={showDataTable ? <LineChart className="w-4 h-4" /> : <Table className="w-4 h-4" />}
        >
          {showDataTable ? 'Show Visual Charts' : 'Show Data Table (A11y)'}
        </Button>
      </div>

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">कुल साधना काल (Time)</span>
            <Clock className="w-4 h-4 text-[#C66A18] dark:text-[#E68A24]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              {Math.floor(totalPracticeTimeSeconds / 60)}m {totalPracticeTimeSeconds % 60}s
            </div>
            <p className="text-[11px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-0.5">Total vocal practice</p>
          </div>
        </Card>

        <Card padding="md" className="border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">सिद्ध अभ्यास (Completed)</span>
            <CheckCircle2 className="w-4 h-4 text-[#77764B] dark:text-[#D4AF65]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              {totalExercisesCompleted}
            </div>
            <p className="text-[11px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-0.5">Distinct exercises</p>
          </div>
        </Card>

        <Card padding="md" className="border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">अखंड साधना (Streak)</span>
            <Flame className="w-4 h-4 text-[#C66A18] fill-[#C66A18] dark:text-[#E68A24] dark:fill-[#E68A24]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              {data.streak.current} <span className="text-xs font-normal text-[#722F37] dark:text-[#E8D5B5]">/ {data.streak.longest} max</span>
            </div>
            <p className="text-[11px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-0.5">Consecutive calendar days</p>
          </div>
        </Card>

        <Card padding="md" className="border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">स्तर एवं अनुभव (XP)</span>
            <Zap className="w-4 h-4 text-[#D4AF65]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              Lvl {data.level}
            </div>
            <p className="text-[11px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-0.5">{data.xp} cumulative XP</p>
          </div>
        </Card>
      </div>

      {/* 7-Day Activity Chart */}
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
              साप्ताहिक अभ्यास चक्र (Last 7 Days Activity)
            </h2>
            <p className="text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/80">
              Exercises and interview responses recorded per calendar day.
            </p>
          </div>
          <span className="text-xs text-[#C66A18] dark:text-[#E68A24] font-mono">
            {last7DaysData.reduce((sum, d) => sum + d.count, 0)} total sessions this week
          </span>
        </div>

        {showDataTable ? (
          /* Accessible Data Table Toggle */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E8D5B5]/60 dark:border-[#3D352F] text-[#722F37] dark:text-[#E8D5B5] uppercase font-mono">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Day</th>
                  <th className="py-2">Activities Recorded</th>
                  <th className="py-2">Speaking Minutes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5B5]/40 dark:divide-[#3D352F]">
                {last7DaysData.map((d) => (
                  <tr key={d.dateStr}>
                    <td className="py-2 font-mono text-[#201B18] dark:text-[#FFF9EF]">{d.dateStr}</td>
                    <td className="py-2 font-serif text-[#722F37] dark:text-[#E8D5B5]">{d.label}</td>
                    <td className="py-2 font-mono font-bold text-[#C66A18] dark:text-[#E68A24]">{d.count}</td>
                    <td className="py-2 font-mono text-[#201B18] dark:text-[#FFF9EF]">{d.minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Accessible Temple Gold Bar Chart */
          <div className="pt-4">
            <div
              role="img"
              aria-label="Bar chart showing weekly practice activity over the past 7 days"
              className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 px-2"
            >
              {last7DaysData.map((day) => {
                const heightPercent = Math.max(8, (day.count / maxDayCount) * 100);
                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-[#722F37] dark:text-[#E8D5B5] opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.count} runs
                    </span>
                    <div
                      className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                        day.count > 0
                          ? 'bg-gradient-to-t from-[#C66A18] to-[#E68A24] hover:to-[#D4AF65] border border-[#D4AF65]/40'
                          : 'bg-[#E8D5B5]/40 dark:bg-[#3D352F]/40'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <div className="text-center">
                      <span className="text-xs font-serif font-semibold text-[#201B18] dark:text-[#FFF9EF] block">
                        {day.label}
                      </span>
                      <span className="text-[9px] text-[#722F37] dark:text-[#E8D5B5] font-mono block">
                        {day.minutes > 0 ? `${day.minutes}m` : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Grounded Skill Analysis Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pacing & Speed Metrics */}
        <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C66A18] dark:text-[#E68A24]" />
              <span>Grounded Skill: Pacing & Speed</span>
            </h2>
            <Badge variant="outline" size="sm">WPM Targets</Badge>
          </div>

          {!hasEnoughData ? (
            <div className="p-6 text-center rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] border border-dashed border-[#E8D5B5] dark:border-[#3D352F] text-xs text-[#722F37] dark:text-[#E8D5B5]">
              Not enough data yet. Complete at least 3 practice drills to generate pacing analytics.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between p-3 rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] border border-[#E8D5B5]/40 dark:border-[#3D352F]">
                <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">Average Speaking Speed:</span>
                <span className="text-lg font-serif font-bold font-mono text-[#201B18] dark:text-[#FFF9EF]">
                  {averageWpm} WPM
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#722F37] dark:text-[#E8D5B5]">
                <div className="flex justify-between text-[11px]">
                  <span>Pacing Consistency</span>
                  <span className="font-mono text-[#C66A18] dark:text-[#E68A24]">
                    {averageWpm >= 110 && averageWpm <= 160 ? 'Optimal (Target Achieved)' : 'Needs Calibration'}
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(100, Math.max(10, Math.round((averageWpm / 150) * 100)))}
                  color="kesari"
                  size="sm"
                />
              </div>

              <p className="text-[11px] text-[#722F37]/80 dark:text-[#E8D5B5]/75 leading-relaxed pt-1">
                Measured strictly from words spoken divided by recording duration. Ideal conversational range: 120-150 WPM.
              </p>
            </div>
          )}
        </Card>

        {/* Transcription Match Trend */}
        <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#77764B] dark:text-[#D4AF65]" />
              <span>Transcription Match Trend</span>
            </h2>
            <Badge variant="outline" size="sm">Alignment</Badge>
          </div>

          {!hasEnoughData || averageMatchPercent === null ? (
            <div className="p-6 text-center rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] border border-dashed border-[#E8D5B5] dark:border-[#3D352F] text-xs text-[#722F37] dark:text-[#E8D5B5]">
              Not enough data yet. Enable transcription and complete 3 drills to view alignment trends.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between p-3 rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] border border-[#E8D5B5]/40 dark:border-[#3D352F]">
                <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">Average Word Match:</span>
                <span className="text-lg font-serif font-bold font-mono text-[#77764B] dark:text-[#D4AF65]">
                  {averageMatchPercent}%
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#722F37] dark:text-[#E8D5B5]">
                <div className="flex justify-between text-[11px]">
                  <span>Target Alignment</span>
                  <span className="font-mono">{averageMatchPercent}% / 100%</span>
                </div>
                <ProgressBar value={averageMatchPercent} color="gold" size="sm" />
              </div>

              <p className="text-[11px] text-[#722F37]/80 dark:text-[#E8D5B5]/75 leading-relaxed pt-1">
                Reflects standard speech-to-text recognition match against expected texts. Not a certified clinical articulation score.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Achievements Badges (Data-Driven) */}
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#D4AF65]" />
              <span>विद्या सिद्धि • Earned Achievements ({data.unlockedAchievements.length} of {achievements.length})</span>
            </h2>
            <p className="text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-0.5">
              Data-driven milestones unlocked through dedicated vocal practice.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = data.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-[#F5EBDD]/70 dark:bg-[#28211D] border-[#D4AF65] shadow-xs'
                    : 'bg-[#FFF9EF]/40 dark:bg-[#201B18]/40 border-[#E8D5B5]/60 dark:border-[#3D352F] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-[#E68A24] to-[#C66A18] text-white shadow-xs border border-[#D4AF65]'
                        : 'bg-[#E8D5B5]/50 dark:bg-[#3D352F] text-[#722F37] dark:text-[#E8D5B5]'
                    }`}
                  >
                    {isUnlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <Badge variant={isUnlocked ? 'gold' : 'outline'} size="sm">
                    {isUnlocked ? 'Unlocked' : `${ach.progress}/${ach.maxProgress}`}
                  </Badge>
                </div>

                <h3 className="text-sm font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                  {ach.title}
                </h3>
                <p className="text-xs text-[#722F37] dark:text-[#E8D5B5] mt-1 leading-relaxed">
                  {ach.description}
                </p>

                {!isUnlocked && (
                  <div className="mt-3">
                    <ProgressBar
                      value={(ach.progress / ach.maxProgress) * 100}
                      size="sm"
                      color="kesari"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
