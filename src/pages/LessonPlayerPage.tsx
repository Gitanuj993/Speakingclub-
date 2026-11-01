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
        <h2 className="text-lg font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">Drill Not Found</h2>
        <p className="text-xs text-[#722F37] dark:text-[#E8D5B5] mt-1">
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
          'A valid practice repetition requires at least 1.5 seconds of vocalization.'
        );
        return;
      }

      // Check alignment if transcription was enabled
      if (shouldRunRecognition && transcript) {
        const alignResult = alignWords(exercise.text, transcript);
        setLastSpeechResult({
          transcript,
          matchPercent: alignResult.matchPercent,
          diff: alignResult.diff,
        });

        // Any attempt counts towards user practice
        setCompletedReps((prev) => prev + 1);
        setIsSelfCheckConfirmed(true);
      } else {
        // Fallback or transcription-disabled practice: prompt self check
        setLastSpeechResult({
          transcript: '',
          matchPercent: null,
          diff: [],
        });
        setCompletedReps((prev) => prev + 1);
        setIsSelfCheckConfirmed(true);
      }
    }
  }, [recorderState, audioBlob, durationMs]);

  // Handle self-repetition confirmation when user practices offline
  const handleConfirmSelfRepetition = () => {
    setIsSelfCheckConfirmed(true);
    setCompletedReps((prev) => prev + 1);
    info('Repetition Added', `Practice repetition recorded.`);
  };

  // Finalize and save exercise attempt
  const handleCompleteLesson = async () => {
    if (!audioBlob) {
      warning('Audio Needed', 'Please record at least one practice attempt first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const wordCount = exercise.text.split(/\s+/).length;
      const calculatedWpm = calculateWpm(wordCount, durationMs);
      const recognizedText = lastSpeechResult?.transcript || transcript || '';
      const fillerResult = detectFillerWords(recognizedText);

      await saveExerciseAttempt(
        {
          exerciseId: exercise.id,
          moduleId: exercise.moduleId || '',
          level: exercise.level,
          category: exercise.category,
          wpm: calculatedWpm,
          durationMs,
          repetitionsCompleted: completedReps || 1,
          matchPercent: lastSpeechResult?.matchPercent ?? undefined,
          transcript: recognizedText,
        },
        audioBlob || undefined
      );

      navigate(`/lesson/${exercise.id}/results`, {
        state: {
          wpm: calculatedWpm,
          durationMs,
          speechResult: lastSpeechResult,
          exerciseId: exercise.id,
        },
      });
    } catch (err: any) {
      toastError('Save Error', err?.message || 'Could not save exercise attempt.');
      setIsSubmitting(false);
    }
  };

  // All exercises are unlocked and available to complete with 1 repetition
  const canComplete = completedReps >= 1 || audioUrl !== null || audioBlob !== null;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link
              to={moduleInfo ? '/learn/alphabet' : '/learn'}
              className="flex items-center gap-1.5 text-xs font-serif text-[#722F37] hover:text-[#C66A18] dark:text-[#E8D5B5] dark:hover:text-[#E68A24] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Path</span>
            </Link>
            {nextExercise && (
              <>
                <span className="text-[#D4AF65]">•</span>
                <Link
                  to={`/lesson/${nextExercise.id}`}
                  className="flex items-center gap-1 text-xs font-serif text-[#C66A18] dark:text-[#E68A24] hover:underline"
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
                  ? 'gold'
                  : exercise.level === 'intermediate'
                  ? 'warning'
                  : 'maroon'
              }
              size="sm"
              className="capitalize"
            >
              {exercise.level}
            </Badge>
          </div>
        </div>

        {/* Drill Title & Repetition Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E8D5B5]/60 dark:border-[#3D352F]">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
              {exercise.title}
            </h1>
            <p className="text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-1">
              Objective: <span className="text-[#201B18] dark:text-[#FFF9EF] font-medium">{exercise.objective}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9EF] dark:bg-[#201B18] border border-[#E8D5B5] dark:border-[#3D352F] rounded-xl px-3.5 py-2 self-start sm:self-auto shadow-xs">
            <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">Practice Reps:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-[#201B18] dark:text-[#FFF9EF]">
              <span className={completedReps > 0 ? 'text-[#77764B] dark:text-[#D4AF65]' : ''}>
                {completedReps}
              </span>
              <span className="text-xs font-normal text-[#722F37] dark:text-[#E8D5B5]">done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Central Large Readable Text Area */}
      <div className="my-8 sm:my-10 space-y-6">
        <Card
          padding="lg"
          className="shadow-md border-[#D4AF65]/50 dark:border-[#D4AF65]/30 bg-gradient-to-b from-[#FFF9EF] to-[#F5EBDD] dark:from-[#201B18] dark:to-[#28211D] text-center relative overflow-hidden"
        >
          {/* Target sound indicator */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-serif font-semibold px-3 py-1 rounded-full bg-[#E8D5B5]/60 dark:bg-[#C66A18]/20 text-[#C66A18] dark:text-[#E68A24] border border-[#D4AF65]/40">
              <Sparkles className="w-3.5 h-3.5" />
              Target Sound: {exercise.targetSounds.join(', ')}
            </span>
          </div>

          {/* Drill text */}
          <p className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#201B18] dark:text-[#FFF9EF] leading-relaxed max-w-2xl mx-auto py-4 select-text">
            {exercise.text}
          </p>

          {/* Tip */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#722F37] dark:text-[#E8D5B5] pt-3 border-t border-[#E8D5B5]/60 dark:border-[#3D352F]">
            <Info className="w-4 h-4 text-[#C66A18] dark:text-[#E68A24] shrink-0" />
            <span>Articulation Tip: {exercise.tip}</span>
          </div>
        </Card>

        {/* Reference Audio Player with Speed Control */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F5EBDD]/70 dark:bg-[#28211D] border border-[#E8D5B5] dark:border-[#3D352F]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (isSpeaking ? stopTts() : speak(exercise.text))}
              disabled={!ttsSupported}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FFF9EF] dark:bg-[#201B18] text-[#201B18] dark:text-[#FFF9EF] text-xs font-serif font-semibold shadow-xs hover:bg-[#E8D5B5]/30 transition-colors border border-[#E8D5B5] dark:border-[#3D352F] min-h-[38px]"
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#C66A18] fill-[#C66A18]" />
                  <span>Pause Model</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#C66A18]" />
                  <span>Listen to Model</span>
                </>
              )}
            </button>
            <span className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">
              Speed:
            </span>
            <div className="inline-flex rounded-lg border border-[#E8D5B5] dark:border-[#3D352F] bg-[#FFF9EF] dark:bg-[#201B18] p-0.5">
              {[0.6, 0.8, 1.0].map((rateOption) => (
                <button
                  key={rateOption}
                  type="button"
                  onClick={() => setTtsRate(rateOption)}
                  className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors ${
                    ttsRate === rateOption
                      ? 'bg-[#C66A18] text-white font-bold'
                      : 'text-[#201B18] dark:text-[#FFF9EF] hover:text-[#C66A18]'
                  }`}
                >
                  {rateOption}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#722F37] dark:text-[#E8D5B5] font-mono">
            {exercise.targetWpmRange
              ? `Target: ${exercise.targetWpmRange[0]}-${exercise.targetWpmRange[1]} WPM`
              : 'Pacing: Controlled & Natural'}
          </div>
        </div>

        {/* Live Status and Errors */}
        {recorderError && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-[#C64B32]/10 border border-[#C64B32]/30 text-xs text-[#C64B32]"
          >
            {recorderError}
          </div>
        )}
      </div>

      {/* Bottom Practice Controls */}
      <div className="pt-6 border-t border-[#E8D5B5]/60 dark:border-[#3D352F] space-y-4">
        {/* Active Recording or Review Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {recorderState === 'recording' ? (
              <div
                aria-live="polite"
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#C64B32]/15 border border-[#C64B32]/40 text-[#C64B32]"
              >
                <span className="w-3 h-3 rounded-full bg-[#C64B32] animate-ping" />
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
              <div className="text-xs font-serif text-[#722F37] dark:text-[#E8D5B5]">
                Press Record and speak clearly with mindful articulation.
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
                className="w-full sm:w-auto"
              >
                View Full Results
              </Button>
            )}
          </div>
        </div>

        {/* Self check fallback if practice without transcription */}
        {(!shouldRunRecognition || !recognitionSupported) && audioUrl && !isSelfCheckConfirmed && (
          <div className="p-4 rounded-xl bg-[#F5EBDD] dark:bg-[#28211D] border border-[#D4AF65]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-[#201B18] dark:text-[#FFF9EF]">
              <span className="font-serif font-bold text-[#C66A18] dark:text-[#E68A24]">आत्मपरीक्षण (Self-Review):</span> Did you articulate all syllables with clarity and calm pacing?
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
