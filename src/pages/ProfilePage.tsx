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
  HardDrive,
  Sparkles,
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
      a.download = `speakingClub_backup_${new Date().toISOString().split('T')[0]}.json`;
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
        <Badge variant="gold" size="sm">साधना व्यवस्था • Settings & Privacy</Badge>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] tracking-tight mt-1">
          Profile & Practice Configuration
        </h1>
        <p className="text-xs sm:text-sm text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-1">
          Rooted in sacred privacy. All audio and attempt data remains client-side in your personal browser.
        </p>
      </div>

      {/* Local Storage Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#F5EBDD] dark:bg-[#28211D] border border-[#D4AF65]/60 flex items-start gap-3.5 shadow-xs">
        <HardDrive className="w-5 h-5 text-[#C66A18] dark:text-[#E68A24] shrink-0 mt-0.5" />
        <div className="text-xs text-[#201B18] dark:text-[#FFF9EF] leading-relaxed">
          <strong className="block mb-0.5 font-serif font-bold text-[#C66A18] dark:text-[#E68A24]">
            पावनता एवं गोपनीयता • Client-Side Sacred Privacy Guarantee
          </strong>
          speakingClub stores your vocal progress, streak, and audio recordings exclusively in this browser's
          Local Storage and IndexedDB. It does not sync to cloud servers and will be cleared if
          you erase browser site data. Use <strong>Export Progress (JSON)</strong> below to back up your sadhana.
        </div>
      </div>

      {/* Profile Form */}
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F]">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5B5]/60 dark:border-[#3D352F]">
            <User className="w-5 h-5 text-[#C66A18] dark:text-[#E68A24]" />
            <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
              Personal Information & Goals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-serif font-semibold text-[#722F37] dark:text-[#E8D5B5] mb-1"
              >
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8D5B5] dark:border-[#3D352F] bg-[#FFF9EF] dark:bg-[#201B18] text-xs text-[#201B18] dark:text-[#FFF9EF] focus:ring-2 focus:ring-[#C66A18] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-daily-goal"
                className="block text-xs font-serif font-semibold text-[#722F37] dark:text-[#E8D5B5] mb-1"
              >
                दैनिक संकल्प • Daily Target (Drills)
              </label>
              <input
                id="profile-daily-goal"
                type="number"
                min={1}
                max={20}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8D5B5] dark:border-[#3D352F] bg-[#FFF9EF] dark:bg-[#201B18] text-xs font-mono text-[#201B18] dark:text-[#FFF9EF] focus:ring-2 focus:ring-[#C66A18] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="profile-primary-goal"
                className="block text-xs font-serif font-semibold text-[#722F37] dark:text-[#E8D5B5] mb-1"
              >
                Primary Goal
              </label>
              <select
                id="profile-primary-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8D5B5] dark:border-[#3D352F] bg-[#FFF9EF] dark:bg-[#201B18] text-xs text-[#201B18] dark:text-[#FFF9EF] focus:ring-2 focus:ring-[#C66A18] focus:outline-none"
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
                className="block text-xs font-serif font-semibold text-[#722F37] dark:text-[#E8D5B5] mb-1"
              >
                Self-Rated Proficiency
              </label>
              <select
                id="profile-proficiency"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8D5B5] dark:border-[#3D352F] bg-[#FFF9EF] dark:bg-[#201B18] text-xs text-[#201B18] dark:text-[#FFF9EF] focus:ring-2 focus:ring-[#C66A18] focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="profile-focus-area"
                className="block text-xs font-serif font-semibold text-[#722F37] dark:text-[#E8D5B5] mb-1"
              >
                Focus Improvement Area
              </label>
              <select
                id="profile-focus-area"
                value={area}
                onChange={(e) => setArea(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8D5B5] dark:border-[#3D352F] bg-[#FFF9EF] dark:bg-[#201B18] text-xs text-[#201B18] dark:text-[#FFF9EF] focus:ring-2 focus:ring-[#C66A18] focus:outline-none"
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
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E8D5B5]/60 dark:border-[#3D352F]">
          <Shield className="w-5 h-5 text-[#C66A18] dark:text-[#E68A24]" />
          <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
            Speech Recognition, Audio & Unlock Controls
          </h2>
        </div>

        <div className="space-y-5 text-xs">
          {/* Transcription Consent Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                Live Speech-to-Text Transcription
              </span>
              <p className="text-[#722F37]/80 dark:text-[#E8D5B5]/80 leading-relaxed">
                Uses the browser's Web Speech API. Audio is processed by browser vendor servers (Google/Microsoft).
                Turn off to practice completely offline with mindful self-review fallback.
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
                !settings.practiceWithoutTranscription ? 'bg-[#C66A18]' : 'bg-[#E8D5B5] dark:bg-[#3D352F]'
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
          <div className="flex items-start justify-between gap-4 pt-3 border-t border-[#E8D5B5]/60 dark:border-[#3D352F]">
            <div className="space-y-0.5">
              <span className="font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                Save Practice Audio Locally on This Device (IndexedDB)
              </span>
              <p className="text-[#722F37]/80 dark:text-[#E8D5B5]/80 leading-relaxed">
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
                settings.saveAudioPreference ? 'bg-[#C66A18]' : 'bg-[#E8D5B5] dark:bg-[#3D352F]'
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
          <div className="flex items-start justify-between gap-4 pt-3 border-t border-[#E8D5B5]/60 dark:border-[#3D352F]">
            <div className="space-y-0.5">
              <span className="font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] flex items-center gap-2">
                <span>All Alphabet Modules & Levels Unlocked</span>
                <span className="text-[10px] bg-[#77764B]/20 text-[#77764B] dark:text-[#D4AF65] border border-[#77764B]/30 px-2 py-0.5 rounded-full font-semibold">Active</span>
              </span>
              <p className="text-[#722F37]/80 dark:text-[#E8D5B5]/80 leading-relaxed">
                All 26 letters and all 3 difficulty tiers (Beginner, Intermediate, Advanced) are fully open.
                You can practice any exercise at any time without sequence locks or repetition requirements.
              </p>
            </div>
          </div>

          {/* Default Playback Speed */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#E8D5B5]/60 dark:border-[#3D352F]">
            <div>
              <span className="font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
                Reference Audio Speed (TTS)
              </span>
              <p className="text-[#722F37]/80 dark:text-[#E8D5B5]/80">
                Default speed when listening to model pronunciation.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-[#E8D5B5] dark:border-[#3D352F] bg-[#F5EBDD] dark:bg-[#28211D] p-1">
              {[0.6, 0.8, 1.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => updateSettings({ playbackSpeed: spd })}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                    settings.playbackSpeed === spd
                      ? 'bg-[#C66A18] text-white font-bold'
                      : 'text-[#201B18] dark:text-[#FFF9EF]'
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
      <Card padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F] space-y-4">
        <h2 className="text-base font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
          Data Backup & Management
        </h2>
        <p className="text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/80 leading-relaxed">
          Export your complete Speaking history, streak, XP, and ratings as JSON to move to another browser,
          or reset everything back to fresh defaults.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-4 h-4 text-[#C66A18]" />}
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
            icon={<RotateCcw className="w-4 h-4 text-[#C64B32]" />}
            className="text-[#C64B32] ml-auto"
          >
            Reset All Data
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset All speakingClub Data"
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
