/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { getLevelProgress } from '../utils/xp';
import { getLocalDateString } from '../utils/dates';
import {
  getAllExercises,
  getDailyChallenge,
  getInterviewQuestions,
} from '../services/curriculumService';
import {
  Flame,
  Zap,
  Target,
  Play,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data, profile } = useUser();
  const todayKey = getLocalDateString();

  const levelProgress = useMemo(() => getLevelProgress(data.xp), [data.xp]);
  const dailyChallenge = useMemo(() => getDailyChallenge(data, todayKey), [data, todayKey]);

  // Exercises completed today
  const exercisesCompletedToday = useMemo(() => {
    return Object.values(data.completedExercises).filter((ex) =>
      ex.lastPracticedAt.startsWith(todayKey)
    ).length;
  }, [data.completedExercises, todayKey]);

  // Rule-based recommended exercise to continue practicing
  const nextRecommendedExercise = useMemo(() => {
    const all = getAllExercises();
    // Find first exercise not yet completed
    const uncompleted = all.find(
      (ex) => !data.completedExercises[`${ex.id}-${ex.level}`]
    );
    return uncompleted || all[0];
  }, [data.completedExercises]);

  const recommendedInterviewQuestion = useMemo(() => {
    const questions = getInterviewQuestions();
    const unattempted = questions.find(
      (q) => !data.interviewAttempts.some((a) => a.questionId === q.id)
    );
    return unattempted || questions[0];
  }, [data.interviewAttempts]);

  const totalCompletedCount = Object.keys(data.completedExercises).length;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-serif font-semibold tracking-wider uppercase text-[#C66A18] dark:text-[#E68A24]">
              वाक् साधना सदन • Daily Practice Sanctum
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] tracking-tight">
            स्वागतम्, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-1">
            Focus: <span className="font-semibold text-[#C66A18] dark:text-[#E68A24] capitalize">{profile.primaryGoal.replace('-', ' ')}</span> • Goal: {profile.dailyGoalExercises} drills/day
          </p>
        </div>

        {/* Daily Goal Pill */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFF9EF] dark:bg-[#201B18] border border-[#E8D5B5] dark:border-[#3D352F] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#E8D5B5]/40 dark:bg-[#C66A18]/20 text-[#C66A18] dark:text-[#E68A24] flex items-center justify-center shrink-0 border border-[#D4AF65]/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-serif font-semibold text-[#201B18] dark:text-[#FFF9EF]">दैनिक संकल्प (Daily Target)</span>
              <span className="font-mono font-bold text-[#C66A18] dark:text-[#E68A24]">
                {exercisesCompletedToday} / {profile.dailyGoalExercises}
              </span>
            </div>
            <div className="w-32 mt-1.5">
              <ProgressBar
                value={exercisesCompletedToday}
                max={profile.dailyGoalExercises}
                size="sm"
                color="kesari"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dominant "Continue Practicing" Card */}
      <div className="w-full">
        <Card
          padding="lg"
          className="relative overflow-hidden border-[#D4AF65]/60 dark:border-[#D4AF65]/30 bg-gradient-to-br from-[#FFF9EF] via-[#F5EBDD] to-[#E8D5B5]/30 dark:from-[#201B18] dark:via-[#28211D] dark:to-[#382B21] shadow-md"
        >
          {/* Subtle sacred lotus / corner motif */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#D4AF65]/10 dark:bg-[#D4AF65]/5 blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="gold" size="sm">
                  साधना आरम्भ • Up Next
                </Badge>
                <span className="text-xs font-mono text-[#722F37] dark:text-[#E8D5B5] uppercase tracking-wider">
                  {nextRecommendedExercise.category} • {nextRecommendedExercise.level}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                {nextRecommendedExercise.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#201B18]/80 dark:text-[#E8D5B5]/85 italic line-clamp-2">
                "{nextRecommendedExercise.text}"
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/75 pt-1">
                <span>🎯 {nextRecommendedExercise.objective}</span>
                <span className="text-[#C66A18] dark:text-[#E68A24] font-medium">✨ All 26 Modules & Levels Unlocked</span>
              </div>
            </div>

            <Link to={`/lesson/${nextRecommendedExercise.id}`} className="shrink-0 w-full md:w-auto">
              <Button
                size="lg"
                variant="primary"
                icon={<Play className="w-4 h-4 fill-white" />}
                className="w-full md:w-auto shadow-md shadow-[#C66A18]/25 px-8"
              >
                Continue Sadhana
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <Card padding="md" className="flex flex-col justify-between border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium text-[#722F37] dark:text-[#E8D5B5]">अखंड अभ्यास (Streak)</span>
            <div className="w-8 h-8 rounded-lg bg-[#E68A24]/15 text-[#C66A18] dark:text-[#E68A24] flex items-center justify-center border border-[#E68A24]/30">
              <Flame className="w-4 h-4 fill-[#C66A18] dark:fill-[#E68A24]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              {data.streak.current} <span className="text-xs font-normal text-[#722F37] dark:text-[#E8D5B5]">days</span>
            </div>
            <p className="text-[11px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-1">
              Best: {data.streak.longest} consecutive days
            </p>
          </div>
        </Card>

        {/* Level & XP */}
        <Card padding="md" className="flex flex-col justify-between border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium text-[#722F37] dark:text-[#E8D5B5]">विद्या स्तर (Level & XP)</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF65]/20 text-[#C66A18] dark:text-[#D4AF65] flex items-center justify-center border border-[#D4AF65]/35">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              Lvl {data.level}
            </div>
            <div className="mt-1.5">
              <ProgressBar
                value={levelProgress.progressPercent}
                size="sm"
                color="gold"
              />
              <p className="text-[10px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-1 flex justify-between font-mono">
                <span>{data.xp} Total XP</span>
                <span>+{levelProgress.xpNeededForNextLevel - levelProgress.xpInCurrentLevel} XP</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Exercises Done */}
        <Card padding="md" className="flex flex-col justify-between border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium text-[#722F37] dark:text-[#E8D5B5]">सम्पूर्ण अभ्यास (Completed)</span>
            <div className="w-8 h-8 rounded-lg bg-[#77764B]/15 text-[#77764B] dark:text-[#D4AF65] flex items-center justify-center border border-[#77764B]/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              {totalCompletedCount}
            </div>
            <p className="text-[11px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-1">
              {data.attempts.length} total vocal recordings
            </p>
          </div>
        </Card>

        {/* Interview Attempts */}
        <Card padding="md" className="flex flex-col justify-between border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium text-[#722F37] dark:text-[#E8D5B5]">साक्षात्कार (Interviews)</span>
            <div className="w-8 h-8 rounded-lg bg-[#722F37]/15 text-[#722F37] dark:text-[#E8D5B5] flex items-center justify-center border border-[#722F37]/30">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              {data.interviewAttempts.length}
            </div>
            <p className="text-[11px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 mt-1">
              Recorded responses
            </p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Daily Challenge & Recommended Drills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Challenge (Date Seeded) */}
        <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-serif font-semibold text-[#C66A18] dark:text-[#E68A24]">
                <Calendar className="w-4 h-4" />
                <span>साधना सूत्र • Today's Challenge</span>
              </div>
              <Badge variant={dailyChallenge.completed ? 'success' : 'warning'} size="sm">
                {dailyChallenge.completed ? 'Completed' : `+${dailyChallenge.xpReward} XP`}
              </Badge>
            </div>
            <h3 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
              {dailyChallenge.title}
            </h3>
            <p className="text-xs text-[#201B18]/75 dark:text-[#E8D5B5]/75 mt-2 leading-relaxed">
              {dailyChallenge.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8D5B5]/60 dark:border-[#3D352F] flex items-center justify-between">
            <span className="text-xs text-[#722F37] dark:text-[#E8D5B5] font-mono">
              {dailyChallenge.completed ? '✓ XP Claimed' : 'Complete 1 rep to finish'}
            </span>
            <Link to={`/lesson/${dailyChallenge.exerciseId}`}>
              <Button size="sm" variant={dailyChallenge.completed ? 'outline' : 'primary'}>
                {dailyChallenge.completed ? 'Practice Again' : 'Take Challenge'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quick Link to Interview Practice */}
        <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="maroon" size="sm">साक्षात्कार • Interview Prep</Badge>
              <span className="text-xs text-[#722F37] dark:text-[#E8D5B5]">Placement Simulation</span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
              {recommendedInterviewQuestion.question}
            </h3>
            <p className="text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-2">
              Framework: <span className="font-semibold text-[#C66A18] dark:text-[#E68A24]">{recommendedInterviewQuestion.framework}</span>
            </p>
            <div className="flex items-center gap-3 text-xs text-[#722F37] dark:text-[#E8D5B5] mt-2 font-mono">
              <span>⏱️ {recommendedInterviewQuestion.prepSeconds}s prep</span>
              <span>🎙️ {recommendedInterviewQuestion.speakSeconds}s speak</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8D5B5]/60 dark:border-[#3D352F] flex items-center justify-between">
            <span className="text-xs text-[#C66A18] dark:text-[#E68A24] font-semibold">
              Category: {recommendedInterviewQuestion.categoryLabel}
            </span>
            <Link to={`/practice/interview?q=${recommendedInterviewQuestion.id}`}>
              <Button size="sm" variant="secondary" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                Simulate
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quick Hub Navigator */}
        <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#C66A18] dark:text-[#E68A24]" />
              <h3 className="text-sm font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                ज्ञान मार्ग • Learning Paths
              </h3>
            </div>
            <div className="space-y-2.5">
              <Link
                to="/learn/alphabet"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] hover:bg-[#E8D5B5]/40 dark:hover:bg-[#342A23] border border-[#E8D5B5]/50 dark:border-[#3D352F] transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C66A18] dark:text-[#E68A24]" />
                  <span className="font-serif font-medium text-[#201B18] dark:text-[#FFF9EF]">26 Alphabet Modules (Unlocked)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#C66A18] dark:text-[#E68A24]" />
              </Link>
              <Link
                to="/learn"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] hover:bg-[#E8D5B5]/40 dark:hover:bg-[#342A23] border border-[#E8D5B5]/50 dark:border-[#3D352F] transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#D4AF65]" />
                  <span className="font-serif font-medium text-[#201B18] dark:text-[#FFF9EF]">Tongue Twisters & Agility</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#C66A18] dark:text-[#E68A24]" />
              </Link>
              <Link
                to="/practice/interview"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] hover:bg-[#E8D5B5]/40 dark:hover:bg-[#342A23] border border-[#E8D5B5]/50 dark:border-[#3D352F] transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#77764B] dark:text-[#D4AF65]" />
                  <span className="font-serif font-medium text-[#201B18] dark:text-[#FFF9EF]">Interview Hub (30+ Qs)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#C66A18] dark:text-[#E68A24]" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8D5B5]/60 dark:border-[#3D352F] text-[11px] text-[#722F37] dark:text-[#E8D5B5]/70">
            पावनता • All speech data is safely preserved on this device.
          </div>
        </Card>
      </div>
    </div>
  );
};
