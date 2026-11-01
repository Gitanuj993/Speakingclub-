/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  User,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  Mic,
  Moon,
  Sun,
  HardDrive,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, settings, updateProfile, updateSettings, exportData, importData, resetAllData } = useUser();
  const { success, error: toastError, info } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local state for profile inputs
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.primaryGoal);
  const [proficiency, setProficiency] = useState(profile.proficiency);
  const [area, setArea] = useState(profile.mainAreaToImprove);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoalExercises);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Student',
      primaryGoal: goal,
      proficiency,
      mainAreaToImprove: area,
      dailyGoalExercises: Number(dailyGoal) || 3,
    });
    success('Profile Updated', 'Your learning preferences have been saved.');
  };

  const handleExport = () => {
    try {
      const json = exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speaklab_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success('Progress Exported', 'Backup JSON downloaded successfully.');
    } catch {
      toastError('Export Failed', 'Unable to generate JSON backup file.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importData(content);
        if (result.success) {
          success('Progress Imported', 'Your historical attempts, XP, and settings have been restored.');
          // Sync local form state
          const updated = JSON.parse(content);
          if (updated?.profile) {
            setName(updated.profile.name || 'Student');
            setGoal(updated.profile.primaryGoal || 'interview-prep');
            setProficiency(updated.profile.proficiency || 'intermediate');
            setArea(updated.profile.mainAreaToImprove || 'clarity');
            setDailyGoal(updated.profile.dailyGoalExercises || 3);
          }
        } else {
          toastError('Import Error', result.error || 'Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Badge variant="primary" size="sm">Settings & Privacy</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Profile & Practice Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          All data is strictly client-side. Configure transcription consent, audio storage, themes, and backup.
        </p>
      </div>

      {/* Local Storage Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start gap-3">
        <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          <strong className="block mb-0.5 font-bold">Client-Side Architecture Guarantee:</strong>
          SpeakLab stores your progress, attempts, and audio recordings exclusively in this browser's
          Local Storage and IndexedDB. It does not sync across separate devices and will be removed if
          you clear your browser site data. Use <strong>Export Progress (JSON)</strong> below to back up your journey.
        </div>
      </div>

      {/* Profile Form */}
      <Card padding="lg" className="border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information & Goals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-daily-goal"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Daily Practice Target (Exercises)
              </label>
              <input
                id="profile-daily-goal"
                type="number"
                min={1}
                max={20}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="profile-primary-goal"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Primary Goal
              </label>
              <select
                id="profile-primary-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="interview-prep">Interview Preparation</option>
                <option value="pronunciation">Pronunciation & Articulation</option>
                <option value="speaking-fluency">Speaking Fluency & Speed</option>
                <option value="overall-communication">Overall Communication</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="profile-proficiency"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Self-Rated Proficiency
              </label>
              <select
                id="profile-proficiency"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="profile-focus-area"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Focus Improvement Area
              </label>
              <select
                id="profile-focus-area"
                value={area}
                onChange={(e) => setArea(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="clarity">Articulation & Diction</option>
                <option value="speed-control">Pacing & Speed Control</option>
                <option value="fillers">Eliminating Filler Words</option>
                <option value="confidence">Interview Poise</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" variant="primary">
              Save Profile Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Hardware, Speech & Privacy Preferences */}
      <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Speech Recognition, Audio & Unlock Controls
          </h2>
        </div>

        <div className="space-y-5 text-xs">
          {/* Transcription Consent Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white">
                Live Speech-to-Text Transcription
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Uses the browser's Web Speech API. Audio is processed by browser vendor servers (Google/Microsoft).
                Turn off to practice completely offline without remote transcription.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!settings.practiceWithoutTranscription}
              onClick={() => {
                const nextState = !settings.practiceWithoutTranscription;
                updateSettings({
                  practiceWithoutTranscription: nextState,
                  transcriptionConsentGiven: !nextState,
                });
                info(
                  nextState ? 'Transcription Disabled' : 'Transcription Enabled',
                  nextState ? 'Now practicing with self-review fallback only.' : 'Live transcripts will be generated where supported.'
                );
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                !settings.practiceWithoutTranscription ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                  !settings.practiceWithoutTranscription ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Local Device Audio Recording Opt-In */}
          <div className="flex items-start justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white">
                Save Practice Audio Locally on This Device (IndexedDB)
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Privacy default is OFF (audio stays in temporary memory and is discarded when you leave).
                Enable this to preserve audio blobs in your local browser IndexedDB for retrospective playback.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.saveAudioPreference}
              onClick={() => {
                updateSettings({ saveAudioPreference: !settings.saveAudioPreference });
                info(
                  !settings.saveAudioPreference ? 'Local Audio Storage On' : 'Local Audio Storage Off',
                  !settings.saveAudioPreference ? 'User-recorded blobs will be preserved in IndexedDB.' : 'Recorded audio will be discarded upon route exit.'
                );
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                settings.saveAudioPreference ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                  settings.saveAudioPreference ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* All Modules Unlocked Notice */}
          <div className="flex items-start justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>All Alphabet Modules & Levels Unlocked</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">Active</span>
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                All 26 letters and all 3 difficulty tiers (Beginner, Intermediate, Advanced) are fully open.
                You can practice any exercise at any time without sequence locks or repetition requirements.
              </p>
            </div>
          </div>

          {/* Default Playback Speed */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                Reference Audio Speed (TTS)
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Default speed when listening to model pronunciation.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 p-1">
              {[0.6, 0.8, 1.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => updateSettings({ playbackSpeed: spd })}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                    settings.playbackSpeed === spd
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Backup, Import & Factory Reset */}
      <Card padding="lg" className="border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Data Backup & Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Export your complete Speaking history, streak, XP, and ratings as JSON to move to another browser,
          or reset everything back to fresh defaults.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-4 h-4 text-indigo-500" />}
          >
            Export Progress (JSON)
          </Button>

          {/* Import JSON */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            Import Backup (JSON)
          </Button>

          {/* Reset All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResetModal(true)}
            icon={<RotateCcw className="w-4 h-4 text-rose-500" />}
            className="text-rose-600 dark:text-rose-400 ml-auto"
          >
            Reset All Data
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset All SpeakLab Data"
        message="This will permanently delete all your practice attempts, XP, streak, interview responses, and audio recordings from this browser. This cannot be undone. Are you sure?"
        confirmLabel="Reset Everything"
        isDestructive
        onCancel={() => setShowResetModal(false)}
        onConfirm={async () => {
          await resetAllData();
          setShowResetModal(false);
          success('Data Reset', 'All local storage and IndexedDB entries have been wiped.');
        }}
      />
    </div>
  );
};
