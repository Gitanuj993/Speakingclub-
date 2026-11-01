/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  Briefcase,
  Volume2,
  Sparkles,
  MessageSquare,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile.name === 'Student' ? '' : profile.name);
  const [goal, setGoal] = useState(profile.primaryGoal);
  const [proficiency, setProficiency] = useState(profile.proficiency);
  const [area, setArea] = useState(profile.mainAreaToImprove);

  const totalSteps = 4;

  const handleSkip = () => {
    updateProfile({ hasCompletedOnboarding: true });
    navigate('/dashboard');
  };

  const handleFinish = () => {
    updateProfile({
      name: name.trim() || 'Student',
      primaryGoal: goal,
      proficiency,
      mainAreaToImprove: area,
      hasCompletedOnboarding: true,
    });
    navigate('/dashboard');
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto">
      {/* Header with progress and skip */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-xs font-mono font-medium text-slate-500">
          Step {step} of {totalSteps}
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1"
        >
          Skip Setup
        </button>
      </div>

      <ProgressBar
        value={(step / totalSteps) * 100}
        color="indigo"
        size="sm"
        className="mb-8"
      />

      <Card padding="lg" className="w-full shadow-lg border-slate-200 dark:border-slate-800">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What should we call you?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optional. This is stored locally in your browser for personalized practice greetings.
              </p>
            </div>
            <div>
              <label
                htmlFor="user-name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Your Name / Preferred Nickname
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What is your primary speaking goal?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                We'll tailor your recommended drills on the dashboard to this focus.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'interview-prep',
                  title: 'Interview Preparation',
                  desc: 'Placement answers, STAR behavioral questions, system design walkthroughs',
                  icon: <Briefcase className="w-4 h-4 text-indigo-500" />,
                },
                {
                  id: 'pronunciation',
                  title: 'Pronunciation & Articulation',
                  desc: 'Eliminating mumbling, mastering vowel lengths and consonant stops',
                  icon: <Volume2 className="w-4 h-4 text-violet-500" />,
                },
                {
                  id: 'speaking-fluency',
                  title: 'Speaking Fluency & Speed Control',
                  desc: 'Pacing, reducing hesitation, and eliminating filler words',
                  icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
                },
                {
                  id: 'overall-communication',
                  title: 'Overall Communication Confidence',
                  desc: 'Clear articulation, presentation poise, and executive presence',
                  icon: <MessageSquare className="w-4 h-4 text-amber-500" />,
                },
              ].map((item) => {
                const isSelected = goal === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as any)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 min-h-[44px] ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                How would you rate your current speaking comfort?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This helps calibrate initial repetition counts and pace goals.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'beginner',
                  title: 'Developing (Beginner)',
                  desc: 'I often hesitate, run out of breath, or feel nervous speaking in formal interviews.',
                },
                {
                  id: 'intermediate',
                  title: 'Conversational (Intermediate)',
                  desc: 'I can express technical ideas, but sometimes trip over complex words or speak too quickly.',
                },
                {
                  id: 'advanced',
                  title: 'Proficient (Advanced)',
                  desc: 'I communicate well; I want to polish executive presence, nuance, and filler-word elimination.',
                },
              ].map((item) => {
                const isSelected = proficiency === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProficiency(item.id as any)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 min-h-[44px] ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What is your main area to improve?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pinpoint the single vocal trait you want to master first.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'clarity',
                  title: 'Articulation & Crisp Diction',
                  desc: 'Ending consonants, minimal pairs, and crisp speech without mumbling',
                },
                {
                  id: 'speed-control',
                  title: 'Pacing & Speed Control',
                  desc: 'Slowing down from 180+ WPM to a calm, authoritative 130 WPM',
                },
                {
                  id: 'fillers',
                  title: 'Eliminating Filler Words',
                  desc: 'Replacing "um", "uh", "like", and "basically" with deliberate pauses',
                },
                {
                  id: 'confidence',
                  title: 'Interview Presence & Poise',
                  desc: 'Structured STAR answers and confident eye contact / delivery',
                },
              ].map((item) => {
                const isSelected = area === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setArea(item.id as any)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 min-h-[44px] ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            size="md"
            onClick={nextStep}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {step === totalSteps ? 'Complete Setup' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
