/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { getExerciseById, getAlphabetModuleById, getAllExercises } from '../services/curriculumService';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { alignWords } from '../utils/alignment';
import { calculateWpm, detectFillerWords } from '../utils/scoring';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConsentModal } from '../components/common/ConsentModal';
import {
  Volume2,
  Mic,
  Square,
  RotateCcw,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Info,
  Pause,
} from 'lucide-react';

export const LessonPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, settings, updateSettings, saveExerciseAttempt } = useUser();
  const { warning, error: toastError, info } = useToast();

  const exercise = useMemo(() => (id ? getExerciseById(id) : undefined), [id]);
  const moduleInfo = useMemo(
    () => (exercise?.moduleId ? getAlphabetModuleById(exercise.moduleId) : undefined),
    [exercise]
  );

  const nextExercise = useMemo(() => {
    const all = getAllExercises();
    const currIdx = all.findIndex((e) => e.id === id);
    if (currIdx >= 0 && currIdx < all.length - 1) {
      return all[currIdx + 1];
    }
    return null;
  }, [id]);

  // Repetition tracking
  const [completedReps, setCompletedReps] = useState(0);
  const [isSelfCheckConfirmed, setIsSelfCheckConfirmed] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Last attempt analysis for local repetition evaluation
  const [lastSpeechResult, setLastSpeechResult] = useState<any>(null);

  // Audio & Speech hooks
  const {
    state: recorderState,
    audioBlob,
    audioUrl,
    durationMs,
    formattedDuration,
    errorMessage: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder({ maxDurationSeconds: 60 });

  const {
    isSpeaking,
    rate: ttsRate,
    setRate: setTtsRate,
    speak,
    stop: stopTts,
    isSupported: ttsSupported,
  } = useSpeechSynthesis(settings.playbackSpeed);

  const shouldRunRecognition =
    settings.transcriptionConsentGiven === true &&
    !settings.practiceWithoutTranscription;

  const {
    transcript,
    isListening,
    start: startRecognition,
    stop: stopRecognition,
    resetTranscript,
    isSupported: recognitionSupported,
  } = useSpeechRecognition({
    enabled: shouldRunRecognition,
  });

  // Audio player ref for replaying own voice
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  // Ensure speech recognition & TTS stop on unmount
  useEffect(() => {
    return () => {
      stopTts();
      stopRecognition();
    };
  }, [stopTts, stopRecognition]);

  if (!exercise) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Exercise Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          This drill ID does not exist or may have been updated.
        </p>
        <Link to="/learn" className="mt-4 inline-block">
          <Button size="sm">Back to Curriculum</Button>
        </Link>
      </div>
    );
  }

  // Handle Record Trigger
  const handleStartPractice = async () => {
    // Check transcription consent before first recording
    if (settings.transcriptionConsentGiven === null && recognitionSupported) {
      setShowConsentModal(true);
      return;
    }

    resetTranscript();
    const started = await startRecording();
    if (started && shouldRunRecognition) {
      try {
        startRecognition();
      } catch (err) {
        console.warn('Concurrent speech recognition failed:', err);
      }
    }
  };

  // Handle Stop Recording
  const handleStopPractice = () => {
    stopRecording();
    if (shouldRunRecognition) {
      stopRecognition();
    }
  };

  // Evaluate Repetition Validity when recording finishes
  useEffect(() => {
    if (recorderState === 'stopped' && audioBlob && durationMs > 0) {
      const minDuration = 1500; // 1.5 seconds min
      if (durationMs < minDuration) {
        warning(
          'Recording too short',
          'A valid repetition should be at least 1.5 seconds long.'
        );
        return;
      }

      let matchPercent = 0;
      let diffData: any[] = [];

      if (shouldRunRecognition && transcript.trim()) {
        const alignResult = alignWords(exercise.text, transcript);
        matchPercent = alignResult.matchPercent;
        diffData = alignResult.diff;
      }

      const wordCount = exercise.text.split(/\s+/).length;
      const wpm = calculateWpm(wordCount, durationMs);
      const fillers = detectFillerWords(transcript);

      const result = {
        transcript,
        matchPercent,
        diff: diffData,
        wpm,
        durationMs,
        fillers,
        audioBlob,
      };

      // Set speech result
      setLastSpeechResult(result);

      // Increment completed repetitions on recording - no restriction requiring multiple runs
      setCompletedReps((prev) => prev + 1);

      if (shouldRunRecognition) {
        if (matchPercent >= 50) {
          info('Repetition Recorded!', `Match: ${matchPercent}% • Pace: ${wpm} WPM`);
        } else {
          info(
            'Repetition Recorded!',
            `Transcription matched ${matchPercent}%. You can review, try again, or finish now.`
          );
        }
      } else {
        info('Repetition Recorded!', `Pace: ${wpm} WPM. Ready to review or finish.`);
      }
    }
  }, [recorderState, audioBlob, durationMs]);

  // Self-check confirmation for practice without transcription
  const handleConfirmSelfRepetition = () => {
    setCompletedReps((prev) => prev + 1);
    setIsSelfCheckConfirmed(true);
    info('Repetition Confirmed', 'Great job! You can view results or practice again.');
  };

  // Final completion & saving attempt
  const handleCompleteLesson = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const wpm = lastSpeechResult?.wpm || calculateWpm(exercise.text.split(/\s+/).length, durationMs || 3000);
      const match = lastSpeechResult?.matchPercent;

      await saveExerciseAttempt(
        {
          exerciseId: exercise.id,
          moduleId: exercise.moduleId,
          category: exercise.category,
          level: exercise.level,
          durationMs: durationMs || 3000,
          wpm,
          repetitionsCompleted: Math.max(1, completedReps),
          matchPercent: match,
          transcript: lastSpeechResult?.transcript || transcript,
        },
        audioBlob || undefined
      );

      navigate(`/lesson/${exercise.id}/results`, {
        state: {
          exercise,
          speechResult: lastSpeechResult,
          durationMs,
          wpm,
        },
      });
    } catch (err: any) {
      toastError('Save Error', err?.message || 'Could not save exercise attempt.');
      setIsSubmitting(false);
    }
  };

  // All exercises are immediately available and can be completed after 1 repetition or anytime recorded
  const canComplete = completedReps >= 1 || audioUrl !== null || audioBlob !== null;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link
              to={moduleInfo ? '/learn/alphabet' : '/learn'}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Path</span>
            </Link>
            {nextExercise && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <Link
                  to={`/lesson/${nextExercise.id}`}
                  className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Next Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm" className="capitalize">
              {exercise.category}
            </Badge>
            <Badge
              variant={
                exercise.level === 'beginner'
                  ? 'primary'
                  : exercise.level === 'intermediate'
                  ? 'warning'
                  : 'danger'
              }
              size="sm"
              className="capitalize"
            >
              {exercise.level}
            </Badge>
          </div>
        </div>

        {/* Drill Title & Repetition Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {exercise.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Objective: <span className="text-slate-700 dark:text-slate-300">{exercise.objective}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 self-start sm:self-auto shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Practice Reps:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-slate-900 dark:text-white">
              <span className={completedReps > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                {completedReps}
              </span>
              <span className="text-xs font-normal text-slate-400">done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Central Large Readable Text Area */}
      <div className="my-8 sm:my-10 space-y-6">
        <Card
          padding="lg"
          className="shadow-md border-indigo-100 dark:border-indigo-950/60 bg-white dark:bg-slate-900 text-center relative overflow-hidden"
        >
          {/* Target sound indicator */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900">
              <Sparkles className="w-3.5 h-3.5" />
              Target: {exercise.targetSounds.join(', ')}
            </span>
          </div>

          {/* Drill text */}
          <p className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-relaxed max-w-2xl mx-auto py-4 select-text">
            {exercise.text}
          </p>

          {/* Tip */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Articulation Tip: {exercise.tip}</span>
          </div>
        </Card>

        {/* Reference Audio Player with Speed Control */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (isSpeaking ? stopTts() : speak(exercise.text))}
              disabled={!ttsSupported}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors border border-slate-200 dark:border-slate-700 min-h-[38px]"
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  <span>Pause Model</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Listen to Model</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-500">
              Speed:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
              {[0.6, 0.8, 1.0].map((rateOption) => (
                <button
                  key={rateOption}
                  type="button"
                  onClick={() => setTtsRate(rateOption)}
                  className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors ${
                    ttsRate === rateOption
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {rateOption}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {exercise.targetWpmRange
              ? `Target: ${exercise.targetWpmRange[0]}-${exercise.targetWpmRange[1]} WPM`
              : 'Pacing: Controlled & Natural'}
          </div>
        </div>

        {/* Live Status and Errors */}
        {recorderError && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300"
          >
            {recorderError}
          </div>
        )}
      </div>

      {/* Bottom Practice Controls */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
        {/* Active Recording or Review Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {recorderState === 'recording' ? (
              <div
                aria-live="polite"
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800 text-rose-700 dark:text-rose-300"
              >
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider">Recording Live</span>
                <span className="text-xs font-mono font-bold ml-2">{formattedDuration}</span>
              </div>
            ) : audioUrl ? (
              <div className="flex items-center gap-3">
                <audio
                  ref={audioPlayerRef}
                  src={audioUrl}
                  onPlay={() => setIsPlayingRecorded(true)}
                  onEnded={() => setIsPlayingRecorded(false)}
                  onPause={() => setIsPlayingRecorded(false)}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (audioPlayerRef.current) {
                      if (isPlayingRecorded) {
                        audioPlayerRef.current.pause();
                      } else {
                        audioPlayerRef.current.currentTime = 0;
                        audioPlayerRef.current.play();
                      }
                    }
                  }}
                  icon={isPlayingRecorded ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                >
                  {isPlayingRecorded ? 'Pause Playback' : 'Replay Attempt'}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetRecording}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Discard & Retry
                </Button>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Press Record and speak clearly into your microphone.
              </div>
            )}
          </div>

          {/* Record / Stop Action Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {recorderState === 'recording' ? (
              <Button
                variant="danger"
                size="lg"
                onClick={handleStopPractice}
                icon={<Square className="w-4 h-4 fill-white" />}
                className="w-full sm:w-auto"
              >
                Stop Recording
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartPractice}
                icon={<Mic className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {audioUrl ? 'Record Next Repetition' : 'Start Recording'}
              </Button>
            )}

            {/* Complete Lesson CTA - available after 1 recording/rep or whenever recorded */}
            {canComplete && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleCompleteLesson}
                isLoading={isSubmitting}
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
              >
                View Full Results
              </Button>
            )}
          </div>
        </div>

        {/* Self check fallback if practice without transcription */}
        {(!shouldRunRecognition || !recognitionSupported) && audioUrl && !isSelfCheckConfirmed && (
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Self-Review Fallback:</span> Did you pronounce all words
              and consonant stops clearly in this repetition?
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleConfirmSelfRepetition}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Confirm Valid Rep
            </Button>
          </div>
        )}
      </div>

      {/* Speech Recognition Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={() => {
          updateSettings({
            transcriptionConsentGiven: true,
            practiceWithoutTranscription: false,
          });
          setShowConsentModal(false);
          startRecording();
          startRecognition();
        }}
        onDecline={() => {
          updateSettings({
            transcriptionConsentGiven: false,
            practiceWithoutTranscription: true,
          });
          setShowConsentModal(false);
          startRecording();
        }}
      />
    </div>
  );
};
