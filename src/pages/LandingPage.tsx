/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Mic,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Layers,
  Award,
  Zap,
  Briefcase,
  Play,
  RotateCcw,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full pt-16 sm:pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        <Badge
          variant="primary"
          size="md"
          icon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
          className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          Structured Speaking for Engineering Placements
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-[1.12]">
          Speak clearly.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
            Think confidently.
          </span>{' '}
          Interview better.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Structured pronunciation drills, tongue twisters, and technical interview simulations.
          Built for college engineers preparing for campus placements and technical interviews.
        </p>

        {/* CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link to="/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              iconRight={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto text-base px-8 shadow-md shadow-indigo-500/20"
            >
              Start Practicing Free
            </Button>
          </Link>
          <Link to="/learn" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              icon={<Play className="w-4 h-4 text-indigo-500" />}
              className="w-full sm:w-auto text-base"
            >
              Explore Drills
            </Button>
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>100% Client-side. No sign up required. Your voice stays in your browser.</span>
        </div>

        {/* Interactive Interactive Preview Card */}
        <div className="mt-12 sm:mt-16 w-full max-w-3xl text-left">
          <Card
            border
            padding="lg"
            className="shadow-xl bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/80 border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">Level 1 • Beginner</Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Module B • Bilabial Plosives</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Self-Paced Practice • All Unlocked</span>
              </div>
            </div>

            <div className="py-6">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
                "Bright <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-400/40 underline-offset-4">brave</span> builders build sturdy bridges with <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-400/40 underline-offset-4">bold</span> blue blocks."
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Focus:</span>
                Create crisp, energetic lip explosions on every initial /b/ plosive.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>Reference Audio (0.8x / 1.0x)</span>
              </div>
              <Link to="/lesson/alpha-b-beg">
                <Button size="sm" variant="secondary" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                  Try This Drill Live
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section className="w-full py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center mb-12">
          <Badge variant="outline" size="sm">Methodology</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            How SpeakLab Builds Fluency
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Modeled after TypingClub's progressive muscle-memory drills, built for your vocal tract.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md" className="flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-mono text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Listen & Calibrate
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Listen to native reference speech with adjustable pacing (0.6x, 0.8x, 1x). Inspect
              target phonemes and articulation tips for lip and tongue placement.
            </p>
          </Card>

          <Card padding="md" className="flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold font-mono text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Record & Repeat
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Complete required repetitions under live audio feedback. Build physical motor habits
              for tricky consonant clusters and stop consonants.
            </p>
          </Card>

          <Card padding="md" className="flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Analyze & Interview
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Review honest pacing (WPM), word alignment, filler counts, and structured interview
              frameworks (STAR, Present-Past-Future) with zero fake AI scores.
            </p>
          </Card>
        </div>
      </section>

      {/* Learning Pillars */}
      <section className="w-full py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center mb-12">
          <Badge variant="outline" size="sm">Four Pillars</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Complete Curriculum Designed for Placement Success
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card hover padding="lg" className="border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tongue Twisters & Agility
                </h3>
                <span className="text-xs text-slate-500">Rapid tongue gymnastics</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Master muscle-memory speed drills from "Unique New York" to "Pad Kid Poured Curd"
              to loosen tongue tension before critical meetings.
            </p>
            <Link to="/learn" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
              Browse Twisters <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card hover padding="lg" className="border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Alphabet Path (26 Phonemes)
                </h3>
                <span className="text-xs text-slate-500">A to Z phonetic mastery</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              78 progressive exercises covering bilabials, retroflex /r/, sibilants, lateral /l/,
              and vowel lengths with minimal pairs and tips.
            </p>
            <Link to="/learn/alphabet" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
              Explore 26 Modules <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card hover padding="lg" className="border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Reading & Fluency Passages
                </h3>
                <span className="text-xs text-slate-500">Technical & business prose</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Practice reading aloud passages on system design, clean architecture, and browser
              engines to internalize natural cadence and breath control.
            </p>
            <Link to="/learn" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
              View Passages <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card hover padding="lg" className="border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Interview Practice Hub
                </h3>
                <span className="text-xs text-slate-500">30+ curated placement questions</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Timed prep and speaking countdowns for Personal Intros, Behavioral STAR, Project Walkthroughs,
              and Technical Communication with filler tracking.
            </p>
            <Link to="/practice/interview" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
              Start Interview Prep <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </section>

      {/* College Student Value Section */}
      <section className="w-full py-16 px-4 sm:px-6 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="primary" size="sm">Why It Works</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Why Placement Candidates Love SpeakLab
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Pressure</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Practice in complete privacy without worrying about being judged by peers or interviewers.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <Zap className="w-5 h-5 text-indigo-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Measurable Pacing</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Know exactly if you speak too fast (180+ WPM) under stress or drop words in long sentences.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <Award className="w-5 h-5 text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Structured STAR</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Every behavioral question provides concrete checklists and timing targets, not generic tips.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-teal-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Purely Client-Side</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Runs completely in your browser. Audio discarded by default. No hidden cloud uploads.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link to="/dashboard">
              <Button size="lg" variant="primary" iconRight={<ArrowRight className="w-4 h-4" />}>
                Jump Into Your First Lesson
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
