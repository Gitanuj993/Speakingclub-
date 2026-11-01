/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { getInterviewQuestions } from '../services/curriculumService';
import { InterviewQuestion, InterviewCategory, InterviewAttempt } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { calculateWpm, detectFillerWords } from '../utils/scoring';
import { formatFriendlyDate } from '../utils/dates';
import { getAudioBlob } from '../utils/idb';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ConsentModal } from '../components/common/ConsentModal';
import {
  Briefcase,
  Play,
  RotateCcw,
  Square,
  Clock,
  Mic,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  Volume2,
} from 'lucide-react';

type InterviewPhase = 'select' | 'prep' | 'speaking' | 'review';

export const InterviewPracticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQId = searchParams.get('q');

  const { data, settings, updateSettings, saveInterviewAttempt, deleteInterviewAttempt, clearAllInterviewAttempts } = useUser();
  const { success, warning, error: toastError } = useToast();

  const questions = useMemo(() => getInterviewQuestions(), []);

  // Category filter for question selector
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice');

  // Currently selected question
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion>(() => {
    if (initialQId) {
      const found = questions.find((q) => q.id === initialQId);
      if (found) return found;
    }
    return questions[0];
  });

  // Flow phase
  const [phase, setPhase] = useState<InterviewPhase>('select');

  // Self review notes & framework checklist
  const [selfNotes, setSelfNotes] = useState('');
  const [frameworkChecklist, setFrameworkChecklist] = useState<Record<string, boolean>>({});

  // Audio & Speech hooks
  const {
    state: recorderState,
    audioBlob,
    audioUrl,
    durationMs,
    formattedDuration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder({ maxDurationSeconds: selectedQuestion.speakSeconds });

  const shouldRunRecognition =
    settings.transcriptionConsentGiven === true &&
    !settings.practiceWithoutTranscription;

  const {
    transcript,
    start: startRecognition,
    stop: stopRecognition,
    resetTranscript,
    isSupported: recognitionSupported,
  } = useSpeechRecognition({ enabled: shouldRunRecognition });

  // Prep Countdown Timer
  const prepTimer = useCountdown(selectedQuestion.prepSeconds, () => {
    // Prep complete -> auto transition to speaking
    startSpeakingPhase();
  });

  // Speaking Countdown Timer
  const speakingTimer = useCountdown(selectedQuestion.speakSeconds, () => {
    // Speaking limit reached -> auto stop
    handleStopSpeaking();
  });

  // Replay element ref
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingReview, setIsPlayingReview] = useState(false);

  // Modal dialogs
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // History audio playback item
  const [historyAudioUrl, setHistoryAudioUrl] = useState<string | null>(null);

  // Initialize framework checklist when question changes
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    selectedQuestion.frameworkChecklist.forEach((item) => {
      initial[item] = false;
    });
    setFrameworkChecklist(initial);
  }, [selectedQuestion]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      prepTimer.reset();
      speakingTimer.reset();
      stopRecognition();
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return questions;
    return questions.filter((q) => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  const filteredHistory = useMemo(() => {
    if (historyCategoryFilter === 'all') return data.interviewAttempts;
    return data.interviewAttempts.filter((a) => a.category === historyCategoryFilter);
  }, [data.interviewAttempts, historyCategoryFilter]);

  // Start Prep Phase
  const handleStartInterview = () => {
    if (settings.transcriptionConsentGiven === null && recognitionSupported) {
      setShowConsentModal(true);
      return;
    }
    setPhase('prep');
    prepTimer.start(selectedQuestion.prepSeconds);
  };

  // Skip prep and immediately speak
  const handleSkipPrep = () => {
    prepTimer.skip();
    startSpeakingPhase();
  };

  // Start Speaking Phase
  const startSpeakingPhase = async () => {
    setPhase('speaking');
    resetTranscript();
    const started = await startRecording();
    if (started) {
      speakingTimer.start(selectedQuestion.speakSeconds);
      if (shouldRunRecognition) {
        startRecognition();
      }
    }
  };

  // Stop Speaking
  const handleStopSpeaking = () => {
    speakingTimer.pause();
    stopRecording();
    if (shouldRunRecognition) {
      stopRecognition();
    }
    setPhase('review');
  };

  // Final submit attempt
  const handleSaveInterview = async () => {
    try {
      const words = transcript ? transcript.split(/\s+/).length : 30;
      const wpm = calculateWpm(words, durationMs || 10000);
      const fillers = detectFillerWords(transcript);

      await saveInterviewAttempt(
        {
          questionId: selectedQuestion.id,
          category: selectedQuestion.category,
          questionText: selectedQuestion.question,
          prepDurationMs: (selectedQuestion.prepSeconds - prepTimer.secondsLeft) * 1000,
          speakingDurationMs: durationMs || 10000,
          wpm,
          fillerWordsFound: fillers,
          transcript,
          selfNotes,
          frameworkRating: frameworkChecklist,
        },
        audioBlob || undefined
      );

      success('Interview Response Saved', 'Your response has been added to your local history.');
      resetFlow();
    } catch (err: any) {
      toastError('Save Error', err?.message || 'Could not save interview attempt.');
    }
  };

  const resetFlow = () => {
    prepTimer.reset();
    speakingTimer.reset();
    resetRecording();
    resetTranscript();
    setSelfNotes('');
    setPhase('select');
  };

  // Play audio from IndexedDB history item
  const handlePlayHistoryAudio = async (blobId?: string) => {
    if (!blobId) return;
    try {
      const item = await getAudioBlob(blobId);
      if (item && item.blob) {
        const url = URL.createObjectURL(item.blob);
        setHistoryAudioUrl(url);
      } else {
        warning('Recording Not Found', 'This audio recording is not present in local storage.');
      }
    } catch {
      toastError('Audio Error', 'Failed to retrieve recording from local storage.');
    }
  };

  // Rule-based metrics for review
  const reviewWords = transcript ? transcript.split(/\s+/).length : 0;
  const reviewWpm = calculateWpm(reviewWords, durationMs || 1000);
  const reviewFillers = useMemo(() => detectFillerWords(transcript), [transcript]);
  const totalFillersCount = reviewFillers.reduce((acc, curr) => acc + curr.count, 0);

  const isTooShort = durationMs < 15000; // < 15s is likely underdeveloped
  const isTooLong = durationMs >= selectedQuestion.speakSeconds * 1000;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="sm">Interview Practice Hub</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Technical & Behavioral Interview Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Simulate realistic pressure with prep countdowns, speaking timers, STAR structure checklists, and filler-word detection.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'practice', label: 'Practice Studio' },
            { id: 'history', label: 'Attempt History', count: data.interviewAttempts.length },
          ]}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab as any);
            if (phase !== 'select') resetFlow();
          }}
        />
      </div>

      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* Phase 1: Question Selection */}
          {phase === 'select' && (
            <div className="space-y-6">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'personal-intro', label: 'Personal Introduction' },
                  { id: 'education-background', label: 'Education & Background' },
                  { id: 'project-explanation', label: 'Project Explanation' },
                  { id: 'technical-communication', label: 'Technical Communication' },
                  { id: 'behavioral', label: 'Behavioral Questions' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all min-h-[38px] ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Active Featured Question Card */}
              <Card padding="lg" className="border-indigo-200 dark:border-indigo-900 shadow-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {selectedQuestion.categoryLabel}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {selectedQuestion.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>⏱️ Prep: {selectedQuestion.prepSeconds}s</span>
                    <span>🎙️ Speak: {selectedQuestion.speakSeconds}s</span>
                  </div>
                </div>

                <div className="py-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    "{selectedQuestion.question}"
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    <strong>Instructions:</strong> {selectedQuestion.instructions}
                  </p>
                </div>

                {/* Framework and Structure Outline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Recommended Framework: {selectedQuestion.framework}
                    </span>
                    <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      {selectedQuestion.frameworkChecklist.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Sample Structure Outline:
                    </span>
                    <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      {selectedQuestion.sampleStructure.map((step, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex items-center justify-end">
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={handleStartInterview}
                    icon={<Play className="w-4 h-4 fill-white" />}
                  >
                    Begin Simulation
                  </Button>
                </div>
              </Card>

              {/* Questions List for quick selection */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  All Questions in This Category ({filteredQuestions.length})
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredQuestions.map((q) => {
                    const isCurrent = q.id === selectedQuestion.id;
                    const attemptsForQ = data.interviewAttempts.filter((a) => a.questionId === q.id).length;
                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuestion(q)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          isCurrent
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-mono text-slate-400 uppercase">
                              {q.categoryLabel}
                            </span>
                            {attemptsForQ > 0 && (
                              <Badge variant="success" size="sm">
                                {attemptsForQ} practiced
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {q.question}
                          </p>
                        </div>
                        <div className="text-xs text-slate-400 font-mono shrink-0">
                          {q.speakSeconds}s
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Countdown Prep Timer */}
          {phase === 'prep' && (
            <Card padding="lg" className="border-amber-200 dark:border-amber-900/60 text-center py-12 space-y-6">
              <Badge variant="warning" size="md">
                Preparation Time
              </Badge>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white max-w-xl mx-auto">
                  "{selectedQuestion.question}"
                </h2>
                <p className="text-xs text-slate-500 mt-2">
                  Use this time to organize your thoughts according to the {selectedQuestion.framework} model.
                </p>
              </div>

              {/* Big Countdown */}
              <div className="py-4">
                <span className="text-6xl sm:text-7xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                  {prepTimer.secondsLeft}
                </span>
                <p className="text-xs text-slate-400 font-mono mt-1">seconds remaining</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" size="sm" onClick={resetFlow}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={handleSkipPrep}>
                  Skip Prep & Speak Now
                </Button>
              </div>
            </Card>
          )}

          {/* Phase 3: Active Timed Speaking */}
          {phase === 'speaking' && (
            <Card padding="lg" className="border-rose-200 dark:border-rose-900/60 text-center py-10 space-y-6">
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <Badge variant="danger" size="md">Live Interview Response</Badge>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white max-w-xl mx-auto">
                  "{selectedQuestion.question}"
                </h2>
              </div>

              {/* Big Speaking Countdown Clock */}
              <div className="py-2">
                <div className="text-5xl sm:text-6xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {speakingTimer.formattedTime}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Duration: {formattedDuration} (Limit: {selectedQuestion.speakSeconds}s)
                </p>
              </div>

              {/* Live transcript preview if active */}
              {shouldRunRecognition && (
                <div className="max-w-xl mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 min-h-[60px] text-left">
                  <span className="font-semibold text-slate-400 block mb-1">Live Transcription Preview:</span>
                  {transcript || <span className="italic text-slate-400">Listening to your response...</span>}
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleStopSpeaking}
                  icon={<Square className="w-4 h-4 fill-white" />}
                >
                  Finish Response
                </Button>
              </div>
            </Card>
          )}

          {/* Phase 4: Review & Feedback Report */}
          {phase === 'review' && (
            <div className="space-y-6">
              <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <Badge variant="success" size="sm">Response Recorded</Badge>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {selectedQuestion.question}
                    </h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetFlow}>
                    New Question
                  </Button>
                </div>

                {/* Audio Replay */}
                {audioUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <audio
                      ref={reviewAudioRef}
                      src={audioUrl}
                      onPlay={() => setIsPlayingReview(true)}
                      onEnded={() => setIsPlayingReview(false)}
                      onPause={() => setIsPlayingReview(false)}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (reviewAudioRef.current) {
                          if (isPlayingReview) {
                            reviewAudioRef.current.pause();
                          } else {
                            reviewAudioRef.current.play();
                          }
                        }
                      }}
                      icon={<Volume2 className="w-4 h-4 text-indigo-500" />}
                    >
                      {isPlayingReview ? 'Pause' : 'Replay Full Audio'}
                    </Button>
                    <span className="text-xs text-slate-500 font-mono">
                      Speaking Time: {(durationMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                )}

                {/* Rule-Based Basic Communication Feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Speaking Pace</span>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {reviewWpm} <span className="text-xs font-normal">WPM</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Target: 120-150 WPM
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Filler Words Detected</span>
                    <div className={`text-2xl font-bold font-mono mt-1 ${
                      totalFillersCount > 3 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {totalFillersCount}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {reviewFillers.map((f) => `"${f.word}" (${f.count})`).join(', ') || 'Clean delivery'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Length Assessment</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                      {isTooShort ? '⚠️ Too Brief' : isTooLong ? '⚠️ Hit Max Limit' : '✓ Well Balanced'}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {(durationMs / 1000).toFixed(1)}s vs {selectedQuestion.speakSeconds}s limit
                    </span>
                  </div>
                </div>

                {/* Transcript Review */}
                {transcript && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Spoken Transcript:
                    </span>
                    <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono select-text">
                      {transcript}
                    </p>
                  </div>
                )}

                {/* Framework Self-Review Checklist */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {selectedQuestion.framework} Self-Review Checklist
                  </h3>
                  <div className="space-y-2 text-xs">
                    {selectedQuestion.frameworkChecklist.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(frameworkChecklist[item])}
                          onChange={(e) =>
                            setFrameworkChecklist({
                              ...frameworkChecklist,
                              [item]: e.target.checked,
                            })
                          }
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Self Notes */}
                <div className="space-y-1.5 pt-2">
                  <label htmlFor="self-notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Self Notes & Learnings (Saved to local history):
                  </label>
                  <textarea
                    id="self-notes"
                    rows={3}
                    value={selfNotes}
                    onChange={(e) => setSelfNotes(e.target.value)}
                    placeholder="e.g. Next time, state the quantitative latency reduction earlier in the answer..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" onClick={resetFlow} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                    Retry Question
                  </Button>

                  <Button variant="primary" size="md" onClick={handleSaveInterview} icon={<CheckCircle2 className="w-4 h-4" />}>
                    Save to History (+25 XP)
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'personal-intro', label: 'Intro' },
                { id: 'education-background', label: 'Education' },
                { id: 'project-explanation', label: 'Project' },
                { id: 'technical-communication', label: 'Technical' },
                { id: 'behavioral', label: 'Behavioral' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setHistoryCategoryFilter(c.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    historyCategoryFilter === c.id
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {data.interviewAttempts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearAllModal(true)}
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                className="text-rose-600 dark:text-rose-400"
              >
                Clear All History
              </Button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <EmptyState
              title="No interview responses recorded yet"
              description="Complete your first timed response to view speaking cadence, filler counts, and self-review notes."
              icon={<Briefcase className="w-6 h-6 text-indigo-500" />}
              actionLabel="Start Interview Practice"
              onAction={() => setActiveTab('practice')}
            />
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((att) => (
                <Card key={att.id} padding="md" className="border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm" className="capitalize">
                          {att.category.replace('-', ' ')}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatFriendlyDate(att.timestamp)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {att.questionText}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {att.audioBlobId && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handlePlayHistoryAudio(att.audioBlobId)}
                          icon={<Volume2 className="w-3.5 h-3.5" />}
                        >
                          Play Audio
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(att.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete attempt"
                        aria-label="Delete attempt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics bar */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
                    <span>⏱️ Duration: {(att.speakingDurationMs / 1000).toFixed(1)}s</span>
                    <span>📈 Pace: {att.wpm} WPM</span>
                    <span>
                      🗣️ Fillers:{' '}
                      {att.fillerWordsFound.length === 0
                        ? '0'
                        : att.fillerWordsFound.map((f) => `${f.word} (${f.count})`).join(', ')}
                    </span>
                  </div>

                  {att.transcript && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300 font-mono">
                      "{att.transcript}"
                    </div>
                  )}

                  {att.selfNotes && (
                    <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                      <strong>Self Notes:</strong> {att.selfNotes}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden audio element for history playback */}
      {historyAudioUrl && (
        <audio
          src={historyAudioUrl}
          autoPlay
          onEnded={() => setHistoryAudioUrl(null)}
          className="hidden"
        />
      )}

      {/* Speech Recognition Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={() => {
          updateSettings({
            transcriptionConsentGiven: true,
            practiceWithoutTranscription: false,
          });
          setShowConsentModal(false);
          setPhase('prep');
          prepTimer.start(selectedQuestion.prepSeconds);
        }}
        onDecline={() => {
          updateSettings({
            transcriptionConsentGiven: false,
            practiceWithoutTranscription: true,
          });
          setShowConsentModal(false);
          setPhase('prep');
          prepTimer.start(selectedQuestion.prepSeconds);
        }}
      />

      {/* Delete Single Attempt Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Interview Attempt"
        message="Are you sure you want to delete this recorded response? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteInterviewAttempt(deleteTargetId);
            setDeleteTargetId(null);
            success('Attempt Deleted');
          }
        }}
      />

      {/* Clear All Modal */}
      <ConfirmModal
        isOpen={showClearAllModal}
        title="Clear All Interview History"
        message="This will permanently delete all interview responses and saved recordings from your browser storage. Continue?"
        confirmLabel="Clear Everything"
        isDestructive
        onCancel={() => setShowClearAllModal(false)}
        onConfirm={async () => {
          await clearAllInterviewAttempts();
          setShowClearAllModal(false);
          success('History Cleared');
        }}
      />
    </div>
  );
};
