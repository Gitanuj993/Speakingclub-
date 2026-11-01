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

  // Curated rule-based recommendations tailored to goal & area
  const recommendedDrills = useMemo(() => {
    const all = getAllExercises();
    if (profile.mainAreaToImprove === 'speed-control') {
      return all.filter((e) => e.category === 'fluency' || e.level === 'intermediate').slice(0, 3);
    }
    if (profile.mainAreaToImprove === 'clarity') {
      return all.filter((e) => e.category === 'alphabet' || e.category === 'tongue-twister').slice(0, 3);
    }
    return all.slice(0, 3);
  }, [profile.mainAreaToImprove]);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Focus: <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{profile.primaryGoal.replace('-', ' ')}</span> • Goal: {profile.dailyGoalExercises} exercises/day
          </p>
        </div>

        {/* Daily Goal Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Daily Target</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {exercisesCompletedToday} / {profile.dailyGoalExercises}
              </span>
            </div>
            <div className="w-28 mt-1">
              <ProgressBar
                value={exercisesCompletedToday}
                max={profile.dailyGoalExercises}
                size="sm"
                color="indigo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dominant "Continue Practicing" Card */}
      <div className="w-full">
        <Card
          padding="lg"
          className="relative overflow-hidden border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-violet-950/20 shadow-md"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">Dominant Action • Up Next</Badge>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  {nextRecommendedExercise.category} • {nextRecommendedExercise.level}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {nextRecommendedExercise.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic line-clamp-2">
                "{nextRecommendedExercise.text}"
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>🎯 {nextRecommendedExercise.objective}</span>
                <span>✨ All Levels Unlocked</span>
              </div>
            </div>

            <Link to={`/lesson/${nextRecommendedExercise.id}`} className="shrink-0 w-full md:w-auto">
              <Button
                size="lg"
                variant="primary"
                icon={<Play className="w-4 h-4 fill-white" />}
                className="w-full md:w-auto shadow-md shadow-indigo-500/25 px-8"
              >
                Continue Practicing
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Streak</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {data.streak.current} <span className="text-xs font-normal text-slate-500">days</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Best: {data.streak.longest} days
            </p>
          </div>
        </Card>

        {/* Level & XP */}
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Level & XP</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              Lvl {data.level}
            </div>
            <div className="mt-1.5">
              <ProgressBar
                value={levelProgress.progressPercent}
                size="sm"
                color="indigo"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                <span>{data.xp} Total XP</span>
                <span>Next Lvl: {levelProgress.xpNeededForNextLevel - levelProgress.xpInCurrentLevel} XP</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Exercises Done */}
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Drills</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalCompletedCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {data.attempts.length} total practice runs
            </p>
          </div>
        </Card>

        {/* Interview Attempts */}
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Interview Answers</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {data.interviewAttempts.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Recorded responses
            </p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Daily Challenge & Recommended Drills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Challenge (Date Seeded) */}
        <Card padding="lg" className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Calendar className="w-4 h-4" />
                <span>Today's Date-Seeded Challenge</span>
              </div>
              <Badge variant={dailyChallenge.completed ? 'success' : 'warning'} size="sm">
                {dailyChallenge.completed ? 'Completed' : `+${dailyChallenge.xpReward} XP`}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {dailyChallenge.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {dailyChallenge.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              {dailyChallenge.completed ? '✓ XP Claimed' : '0 / 2 reps completed'}
            </span>
            <Link to={`/lesson/${dailyChallenge.exerciseId}`}>
              <Button size="sm" variant={dailyChallenge.completed ? 'outline' : 'primary'}>
                {dailyChallenge.completed ? 'Practice Again' : 'Take Challenge'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quick Link to Interview Practice */}
        <Card padding="lg" className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="primary" size="sm">Interview Ready</Badge>
              <span className="text-xs text-slate-500">Placement Simulation</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {recommendedInterviewQuestion.question}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Framework: <span className="font-semibold text-slate-700 dark:text-slate-300">{recommendedInterviewQuestion.framework}</span>
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
              <span>⏱️ {recommendedInterviewQuestion.prepSeconds}s prep</span>
              <span>🎙️ {recommendedInterviewQuestion.speakSeconds}s speak</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
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
        <Card padding="lg" className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curriculum Paths</h3>
            </div>
            <div className="space-y-2.5">
              <Link
                to="/learn/alphabet"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">26 Alphabet Modules</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/learn"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-violet-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Tongue Twisters & Agility</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/practice/interview"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Interview Hub (30+ Qs)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            Progress is automatically saved to this browser.
          </div>
        </Card>
      </div>
    </div>
  );
};
