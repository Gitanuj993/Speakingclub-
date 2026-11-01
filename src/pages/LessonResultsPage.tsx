/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { getExerciseById, getAllExercises } from '../services/curriculumService';
import { alignWords } from '../utils/alignment';
import {
  calculateWpm,
  evaluatePace,
  generatePracticeSuggestions,
  detectFillerWords,
} from '../utils/scoring';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Gauge,
  Sparkles,
  Info,
  Clock,
  Star,
  Lock,
} from 'lucide-react';

export const LessonResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, settings } = useUser();
  const { success } = useToast();

  const exercise = useMemo(() => (id ? getExerciseById(id) : undefined), [id]);

  // Retrieve state passed from LessonPlayer or fallback to last stored attempt
  const stateData = location.state as any;
  const recentAttempt = useMemo(() => {
    return data.attempts.find((a) => a.exerciseId === id) || null;
  }, [data.attempts, id]);

  const transcript = stateData?.speechResult?.transcript || recentAttempt?.transcript || '';
  const durationMs = stateData?.durationMs || recentAttempt?.durationMs || 4000;

  // Alignment analysis
  const alignment = useMemo(() => {
    if (!exercise || !transcript) return null;
    return alignWords(exercise.text, transcript);
  }, [exercise, transcript]);

  const wordCount = exercise ? exercise.text.split(/\s+/).length : 10;
  const wpm = useMemo(
    () => stateData?.wpm || recentAttempt?.wpm || calculateWpm(wordCount, durationMs),
    [stateData, recentAttempt, wordCount, durationMs]
  );

  const paceEvaluation = useMemo(() => {
    return evaluatePace(wpm, exercise?.targetWpmRange);
  }, [wpm, exercise]);

  const suggestions = useMemo(() => {
    if (!exercise) return [];
    return generatePracticeSuggestions(
      alignment ? alignment.diff : [],
      exercise.targetSounds,
      wpm,
      exercise.targetWpmRange
    );
  }, [alignment, exercise, wpm]);

  // Self review states
  const [checklist, setChecklist] = useState({
    clearArticulation: true,
    controlledPacing: true,
    naturalBreathing: true,
  });
  const [rating, setRating] = useState(4);
  const [hasSavedReview, setHasSavedReview] = useState(false);

  // Next exercise calculation
  const nextExercise = useMemo(() => {
    const all = getAllExercises();
    const currIdx = all.findIndex((e) => e.id === id);
    if (currIdx >= 0 && currIdx < all.length - 1) {
      return all[currIdx + 1];
    }
    return null;
  }, [id]);

  if (!exercise) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Results Not Found</h2>
        <Link to="/learn" className="mt-4 inline-block">
          <Button size="sm">Back to Hub</Button>
        </Link>
      </div>
    );
  }

  const handleSaveSelfReview = () => {
    setHasSavedReview(true);
    success('Self-Review Recorded', 'Your reflections have been saved with this session.');
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              Drill Completed
            </Badge>
            <span className="text-xs text-slate-500 font-mono capitalize">
              {exercise.category} • {exercise.level}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Performance Report: {exercise.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/lesson/${exercise.id}`}>
            <Button variant="outline" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />}>
              Retry Drill
            </Button>
          </Link>
          {nextExercise && (
            <Link to={`/lesson/${nextExercise.id}`}>
              <Button variant="primary" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                Next Drill
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Section 1: Transcription Match (Honest Feedback) */}
      <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>1. Transcription Match</span>
              <Badge variant="outline" size="sm">Honest Metric</Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Word-level alignment between recognized speech and target text.
            </p>
          </div>

          {alignment && (
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {alignment.matchPercent}%
              </span>
              <span className="text-xs text-slate-500">match</span>
            </div>
          )}
        </div>

        {alignment ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap gap-1.5 text-base sm:text-lg leading-relaxed font-medium">
              {alignment.diff.map((item, idx) => {
                if (item.status === 'matched') {
                  return (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                    >
                      {item.word}
                    </span>
                  );
                }
                if (item.status === 'missing') {
                  return (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-rose-100/70 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 line-through decoration-rose-500"
                      title="Word was missing from transcript"
                    >
                      {item.word}
                    </span>
                  );
                }
                if (item.status === 'substituted') {
                  return (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-amber-100/70 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                      title={`Spoken: "${item.spokenWord}" instead of "${item.word}"`}
                    >
                      {item.spokenWord || item.word}*
                    </span>
                  );
                }
                return (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs italic"
                    title="Extra word detected"
                  >
                    +{item.word}
                  </span>
                );
              })}
            </div>

            {/* Crucial honesty disclosure */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>Note on accuracy:</strong> This represents Web Speech transcription match,
                <em> not a certified phonetic pronunciation score</em>. Speech recognizers often
                auto-correct slight acoustic slips to standard words.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-500">
            Transcription was disabled or unavailable during this practice session. You can enable
            it anytime in your Profile settings.
          </div>
        )}
      </Card>

      {/* Section 2 & 3: Pace & Fluency Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 2: Pace */}
        <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-500" />
              <span>2. Speaking Pace</span>
            </h2>
            <Badge
              variant={
                paceEvaluation.status === 'optimal'
                  ? 'success'
                  : paceEvaluation.status === 'too-fast'
                  ? 'warning'
                  : 'default'
              }
              size="sm"
            >
              {paceEvaluation.status}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {wpm}
            </span>
            <span className="text-xs text-slate-500 font-mono">Estimated WPM</span>
          </div>

          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {paceEvaluation.label}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {paceEvaluation.advice}
          </p>

          <p className="text-[10px] text-slate-400 font-mono pt-1">
            *Words in expected text ({wordCount}) divided by speaking duration.
          </p>
        </Card>

        {/* Section 3: Fluency Indicators */}
        <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>3. Measurable Fluency</span>
          </h2>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Total Speaking Time</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {(durationMs / 1000).toFixed(1)}s
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Word Count</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {wordCount} words
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Detected Fillers</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {detectFillerWords(transcript).length === 0 ? 'None (Clean)' : `${detectFillerWords(transcript).length} found`}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 4: Pronunciation & Phoneme Analysis (Honest Disabled Panel) */}
      <Card
        padding="lg"
        className="border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40 opacity-80"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                4. Acoustic Phoneme & Formant Analysis
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              True formant acoustic tracking requires local WebAssembly DSP or calibrated
              client models. We never fabricate artificial phoneme accuracy percentages.
            </p>
          </div>
          <Badge variant="outline" size="sm">Coming in Future Version</Badge>
        </div>
      </Card>

      {/* Section 5: Practice Suggestions */}
      <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>5. Rule-Based Practice Guidance</span>
        </h2>
        <p className="text-xs text-slate-500">
          General vocal mechanics derived from target phonemes and your pacing metrics:
        </p>

        <ul className="space-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300">
          {suggestions.map((sug, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-indigo-500 font-bold shrink-0">•</span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Section 6: Self-Review & Rating */}
      <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            6. Self-Review Checklist & Rating
          </h2>
          <span className="text-xs text-slate-500">Stored with session</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.clearArticulation}
              onChange={(e) =>
                setChecklist({ ...checklist, clearArticulation: e.target.checked })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-slate-700 dark:text-slate-300">
              I enunciated ending consonants without dropping or slurring syllables.
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.controlledPacing}
              onChange={(e) =>
                setChecklist({ ...checklist, controlledPacing: e.target.checked })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-slate-700 dark:text-slate-300">
              My pace felt controlled, intentional, and comfortable to listen to.
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.naturalBreathing}
              onChange={(e) =>
                setChecklist({ ...checklist, naturalBreathing: e.target.checked })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-slate-700 dark:text-slate-300">
              I took natural diaphragm breaths at punctuation pauses rather than mid-clause.
            </span>
          </label>
        </div>

        {/* 1-5 Star Self Rating */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Self-Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 dark:text-slate-700 hover:text-amber-400 focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            variant={hasSavedReview ? 'outline' : 'secondary'}
            onClick={handleSaveSelfReview}
            disabled={hasSavedReview}
          >
            {hasSavedReview ? 'Saved' : 'Save Review'}
          </Button>
        </div>
      </Card>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Link to="/learn">
          <Button variant="ghost" size="sm">
            ← Back to Learning Hub
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Link to={`/lesson/${exercise.id}`}>
            <Button variant="secondary" size="md" icon={<RotateCcw className="w-4 h-4" />}>
              Practice Again
            </Button>
          </Link>
          {nextExercise && (
            <Link to={`/lesson/${nextExercise.id}`}>
              <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                Next Drill
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
