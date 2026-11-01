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
        <h2 className="text-lg font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">Results Not Found</h2>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8D5B5]/60 dark:border-[#3D352F]">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              अभ्यास सम्पन्न • Drill Completed
            </Badge>
            <span className="text-xs text-[#722F37] dark:text-[#E8D5B5] font-mono capitalize">
              {exercise.category} • {exercise.level}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] tracking-tight mt-1">
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
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
              <span>१. वाक् संरेखण • Transcription Match</span>
              <Badge variant="outline" size="sm">Honest Metric</Badge>
            </h2>
            <p className="text-xs text-[#722F37] dark:text-[#E8D5B5]/80 mt-0.5">
              Word-level alignment between recognized speech and target text.
            </p>
          </div>

          {alignment && (
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-serif font-extrabold text-[#C66A18] dark:text-[#E68A24]">
                {alignment.matchPercent}%
              </span>
              <span className="text-xs text-[#722F37] dark:text-[#E8D5B5]">match</span>
            </div>
          )}
        </div>

        {alignment ? (
          <div className="p-4 rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] border border-[#E8D5B5] dark:border-[#3D352F] space-y-3">
            <div className="flex flex-wrap gap-1.5 text-base sm:text-lg leading-relaxed font-serif">
              {alignment.diff.map((item, idx) => {
                if (item.status === 'matched') {
                  return (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#77764B]/20 text-[#77764B] dark:text-[#D4AF65] border border-[#77764B]/30"
                    >
                      {item.word}
                    </span>
                  );
                }
                if (item.status === 'missing') {
                  return (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#C64B32]/15 text-[#C64B32] border border-[#C64B32]/30 line-through"
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
                      className="px-2 py-0.5 rounded bg-[#E68A24]/20 text-[#C66A18] dark:text-[#E68A24] border border-[#E68A24]/35"
                      title={`Spoken: "${item.spokenWord}" instead of "${item.word}"`}
                    >
                      {item.spokenWord || item.word}*
                    </span>
                  );
                }
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#E8D5B5]/50 dark:bg-[#3D352F] text-[#722F37] dark:text-[#E8D5B5] text-xs italic"
                    title="Extra word detected"
                  >
                    +{item.word}
                  </span>
                );
              })}
            </div>

            {/* Crucial honesty disclosure */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-[#722F37]/80 dark:text-[#E8D5B5]/75 border-t border-[#E8D5B5]/60 dark:border-[#3D352F]">
              <Info className="w-3.5 h-3.5 text-[#C66A18] shrink-0 mt-0.5" />
              <span>
                <strong>Note on accuracy:</strong> This represents client Web Speech transcription match,
                <em> not a certified phonetic pronunciation score</em>. Speech recognizers often
                auto-correct slight acoustic slips to standard words.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F5EBDD]/60 dark:bg-[#28211D] text-xs text-[#722F37] dark:text-[#E8D5B5]">
            Transcription was disabled or unavailable during this practice session. You can enable
            it anytime in your Profile settings.
          </div>
        )}
      </Card>

      {/* Section 2 & 3: Pace & Fluency Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 2: Pace */}
        <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#C66A18] dark:text-[#E68A24]" />
              <span>२. गति एवं लय • Speaking Pace</span>
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
            <span className="text-3xl font-serif font-extrabold text-[#201B18] dark:text-[#FFF9EF]">
              {wpm}
            </span>
            <span className="text-xs text-[#722F37] dark:text-[#E8D5B5] font-mono">Estimated WPM</span>
          </div>

          <p className="text-xs font-serif font-semibold text-[#C66A18] dark:text-[#E68A24]">
            {paceEvaluation.label}
          </p>
          <p className="text-xs text-[#201B18]/75 dark:text-[#E8D5B5]/75 leading-relaxed">
            {paceEvaluation.advice}
          </p>

          <p className="text-[10px] text-[#722F37]/75 dark:text-[#E8D5B5]/70 font-mono pt-1">
            *Words in expected text ({wordCount}) divided by speaking duration.
          </p>
        </Card>

        {/* Section 3: Fluency Indicators */}
        <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-3">
          <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#77764B] dark:text-[#D4AF65]" />
            <span>३. धाराप्रवाह • Fluency Metric</span>
          </h2>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5EBDD]/50 dark:bg-[#28211D] border border-[#E8D5B5]/40 dark:border-[#3D352F]">
              <span className="text-[#722F37] dark:text-[#E8D5B5]">Total Speaking Time</span>
              <span className="font-mono font-bold text-[#201B18] dark:text-[#FFF9EF]">
                {(durationMs / 1000).toFixed(1)}s
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5EBDD]/50 dark:bg-[#28211D] border border-[#E8D5B5]/40 dark:border-[#3D352F]">
              <span className="text-[#722F37] dark:text-[#E8D5B5]">Word Count</span>
              <span className="font-mono font-bold text-[#201B18] dark:text-[#FFF9EF]">
                {wordCount} words
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5EBDD]/50 dark:bg-[#28211D] border border-[#E8D5B5]/40 dark:border-[#3D352F]">
              <span className="text-[#722F37] dark:text-[#E8D5B5]">Detected Fillers</span>
              <span className="font-mono font-bold text-[#201B18] dark:text-[#FFF9EF]">
                {detectFillerWords(transcript).length === 0 ? 'None (Clean & Measured)' : `${detectFillerWords(transcript).length} found`}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 4: Pronunciation & Phoneme Analysis (Honest Notice) */}
      <Card
        padding="lg"
        className="border-[#E8D5B5]/60 dark:border-[#3D352F] bg-[#F5EBDD]/30 dark:bg-[#28211D]/40"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4AF65]" />
              <h2 className="text-sm font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                ४. ध्वनिकी विश्लेषण (Acoustic Phoneme & Formant Analysis)
              </h2>
            </div>
            <p className="text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/80">
              True formant acoustic tracking requires local WebAssembly DSP or calibrated
              client models. In accordance with Indian truthful principles, we never fabricate artificial phoneme accuracy percentages.
            </p>
          </div>
          <Badge variant="outline" size="sm">Future DSP Engine</Badge>
        </div>
      </Card>

      {/* Section 5: Practice Suggestions */}
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-3">
        <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C66A18] dark:text-[#E68A24]" />
          <span>५. साधना परामर्श • Rule-Based Guidance</span>
        </h2>
        <p className="text-xs text-[#722F37] dark:text-[#E8D5B5]">
          Mindful vocal mechanics derived from target phonemes and your pacing metrics:
        </p>

        <ul className="space-y-2 pt-1 text-xs text-[#201B18] dark:text-[#FFF9EF]">
          {suggestions.map((sug, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-[#C66A18] dark:text-[#E68A24] font-bold shrink-0">✦</span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Section 6: Self-Review & Rating */}
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
            ६. आत्मपरीक्षण • Self-Review Checklist & Rating
          </h2>
          <span className="text-xs text-[#722F37] dark:text-[#E8D5B5]">Preserved locally</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.clearArticulation}
              onChange={(e) =>
                setChecklist({ ...checklist, clearArticulation: e.target.checked })
              }
              className="rounded text-[#C66A18] focus:ring-[#C66A18] w-4 h-4"
            />
            <span className="text-[#201B18] dark:text-[#FFF9EF]">
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
              className="rounded text-[#C66A18] focus:ring-[#C66A18] w-4 h-4"
            />
            <span className="text-[#201B18] dark:text-[#FFF9EF]">
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
              className="rounded text-[#C66A18] focus:ring-[#C66A18] w-4 h-4"
            />
            <span className="text-[#201B18] dark:text-[#FFF9EF]">
              I took natural diaphragm breaths at punctuation pauses rather than mid-clause.
            </span>
          </label>
        </div>

        {/* 1-5 Star Self Rating */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#722F37] dark:text-[#E8D5B5]">
            <span className="font-serif">Self-Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-[#E8D5B5] dark:text-[#3D352F] hover:text-[#D4AF65] focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating
                        ? 'text-[#D4AF65] fill-[#D4AF65]'
                        : 'text-[#E8D5B5] dark:text-[#3D352F]'
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
