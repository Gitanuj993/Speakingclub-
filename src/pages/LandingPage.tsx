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
        {/* Sacred Sanskrit Invocation Badge */}
        <Badge
          variant="gold"
          size="md"
          icon={<Sparkles className="w-3.5 h-3.5 text-[#C66A18] dark:text-[#D4AF65]" />}
          className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 font-serif"
        >
          वाचं कल्याणीम् • Cultivate Clear & Divine Speech
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#201B18] dark:text-[#FFF9EF] max-w-3xl leading-[1.15] font-serif">
          Speak clearly.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E68A24] via-[#D4AF65] to-[#C66A18]">
            Think confidently.
          </span>{' '}
          Interview better.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-[#6B5E55] dark:text-[#E8D5B5] max-w-2xl leading-relaxed">
          Structured English pronunciation drills, tongue twisters, and placement interview simulations.
          Rooted in mindfulness, composure, and timeless articulation mastery.
        </p>

        {/* CTAs in Saffron and Temple Gold */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link to="/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              iconRight={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto text-base px-8 shadow-md shadow-[#E68A24]/25"
            >
              Begin Your Practice Free
            </Button>
          </Link>
          <Link to="/learn" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              icon={<Play className="w-4 h-4 text-[#C66A18] dark:text-[#D4AF65]" />}
              className="w-full sm:w-auto text-base"
            >
              Explore All Drills
            </Button>
          </Link>
        </div>

        {/* Sacred Privacy Note */}
        <div className="mt-6 flex items-center gap-2 text-xs text-[#6B5E55] dark:text-[#B8A89A]">
          <ShieldCheck className="w-4 h-4 text-[#77764B] dark:text-[#D4AF65] shrink-0" />
          <span>100% Client-side sanctum. No sign-up required. Your voice remains with you.</span>
        </div>

        {/* Interactive Preview Card with Temple Aesthetics */}
        <div className="mt-12 sm:mt-16 w-full max-w-3xl text-left">
          <Card
            border
            padding="lg"
            className="shadow-xl shadow-[#D4AF65]/10 bg-gradient-to-b from-[#FFF9EF] via-[#FFF9EF] to-[#F5EBDD] dark:from-[#201B18] dark:to-[#2A2420] border-[#D4AF65]/40"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E8D5B5] dark:border-[#3D352F]">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">Level 1 • Beginner</Badge>
                <span className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] font-serif">
                  Module B • Bilabial Plosives
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#77764B] dark:text-[#D4AF65]">
                <span className="w-2 h-2 rounded-full bg-[#E68A24]" />
                <span className="font-medium">Self-Paced Practice • All Unlocked</span>
              </div>
            </div>

            <div className="py-6">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#201B18] dark:text-[#FFF9EF] leading-snug font-serif">
                "Bright <span className="text-[#C66A18] dark:text-[#E68A24] underline decoration-[#D4AF65]/60 underline-offset-4">brave</span> builders build sturdy bridges with <span className="text-[#C66A18] dark:text-[#E68A24] underline decoration-[#D4AF65]/60 underline-offset-4">bold</span> blue blocks."
              </p>
              <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] mt-3 flex items-center gap-1.5">
                <span className="font-semibold text-[#201B18] dark:text-[#FFF9EF]">Articulation Focus:</span>
                Create crisp, energetic lip explosions on every initial /b/ stop with resonant vocal cords.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8D5B5] dark:border-[#3D352F] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#6B5E55] dark:text-[#E8D5B5]">
                <Volume2 className="w-4 h-4 text-[#C66A18] dark:text-[#D4AF65]" />
                <span>Reference Audio (0.6x, 0.8x, 1.0x)</span>
              </div>
              <Link to="/lesson/alpha-b-beg">
                <Button size="sm" variant="secondary" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                  Practice This Drill Now
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* How it Works (Three Sacred Principles) */}
      <section className="w-full py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#E8D5B5] dark:border-[#3D352F]">
        <div className="text-center mb-12">
          <Badge variant="outline" size="sm">Sadhana & Methodology</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#201B18] dark:text-[#FFF9EF] mt-2 font-serif">
            Three Steps to Divine Articulation & Poise
          </h2>
          <p className="text-sm text-[#6B5E55] dark:text-[#E8D5B5] mt-2 max-w-md mx-auto">
            Rooted in mindful listening, steady repetition, and grounded interview composure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md" className="flex flex-col border-[#E8D5B5] dark:border-[#3D352F]">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0DF] dark:bg-[#C66A18]/20 text-[#C66A18] dark:text-[#E68A24] border border-[#E68A24]/30 flex items-center justify-center font-bold font-serif text-sm mb-4">
              १. श्रवण
            </div>
            <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif mb-2">
              Shravana (Attentive Listening)
            </h3>
            <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed">
              Listen to native reference speech with adjustable pacing (0.6x, 0.8x, 1x). Observe
              target phonemes and articulation tips for tongue, teeth, and lip placement.
            </p>
          </Card>

          <Card padding="md" className="flex flex-col border-[#E8D5B5] dark:border-[#3D352F]">
            <div className="w-10 h-10 rounded-xl bg-[#FBF6EC] dark:bg-[#D4AF65]/20 text-[#B08930] dark:text-[#D4AF65] border border-[#D4AF65]/35 flex items-center justify-center font-bold font-serif text-sm mb-4">
              २. अभ्यास
            </div>
            <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif mb-2">
              Abhyasa (Dedicated Practice)
            </h3>
            <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed">
              Record and replay your delivery. Build deep physical muscle memory for tricky
              consonant transitions without feeling hurried or pressured.
            </p>
          </Card>

          <Card padding="md" className="flex flex-col border-[#E8D5B5] dark:border-[#3D352F]">
            <div className="w-10 h-10 rounded-xl bg-[#F4F5E6] dark:bg-[#77764B]/20 text-[#616035] dark:text-[#D4AF65] border border-[#77764B]/30 flex items-center justify-center font-bold font-serif text-sm mb-4">
              ३. संवाद
            </div>
            <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif mb-2">
              Samvada (Interview Mastery)
            </h3>
            <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed">
              Master structured frameworks (STAR, Present-Past-Future) with timer composure,
              honest pace evaluation (WPM), and filler elimination without fabricated AI scores.
            </p>
          </Card>
        </div>
      </section>

      {/* Four Learning Pillars */}
      <section className="w-full py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#E8D5B5] dark:border-[#3D352F]">
        <div className="text-center mb-12">
          <Badge variant="outline" size="sm">Four Core Paths</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#201B18] dark:text-[#FFF9EF] mt-2 font-serif">
            A Curriculum Designed for Presence & Authority
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card hover padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0DF] dark:bg-[#C66A18]/20 text-[#C66A18] dark:text-[#E68A24] border border-[#E68A24]/30 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">
                  Vak-Shuddhi (Tongue Twisters & Agility)
                </h3>
                <span className="text-xs text-[#6B5E55] dark:text-[#E8D5B5]">Speech coordination gymnastics</span>
              </div>
            </div>
            <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed mb-4">
              Master rapid coordination drills from "Unique New York" to "Pad Kid Poured Curd"
              to release facial and vocal tension before important conversations.
            </p>
            <Link to="/learn" className="text-xs font-semibold text-[#C66A18] dark:text-[#D4AF65] hover:underline inline-flex items-center gap-1">
              Explore Twisters <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card hover padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBF6EC] dark:bg-[#D4AF65]/20 text-[#B08930] dark:text-[#D4AF65] border border-[#D4AF65]/35 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">
                  Akshara Sadhana (26 Alphabet Modules)
                </h3>
                <span className="text-xs text-[#6B5E55] dark:text-[#E8D5B5]">A to Z phonetic precision</span>
              </div>
            </div>
            <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed mb-4">
              78 unlocked exercises covering bilabials, retroflex /r/, sibilants, lateral /l/,
              and vowel lengths with minimal pairs and tips.
            </p>
            <Link to="/learn/alphabet" className="text-xs font-semibold text-[#C66A18] dark:text-[#D4AF65] hover:underline inline-flex items-center gap-1">
              Explore 26 Letter Modules <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card hover padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4F5E6] dark:bg-[#77764B]/20 text-[#616035] dark:text-[#D4AF65] border border-[#77764B]/30 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">
                  Pathana Vidya (Reading & Technical Prose)
                </h3>
                <span className="text-xs text-[#6B5E55] dark:text-[#E8D5B5]">Measured cadence and breath</span>
              </div>
            </div>
            <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed mb-4">
              Read aloud passages on system design, clean code, browser internals, and continuous delivery
              with calm 120-150 WPM executive pacing.
            </p>
            <Link to="/learn" className="text-xs font-semibold text-[#C66A18] dark:text-[#D4AF65] hover:underline inline-flex items-center gap-1">
              View Reading Passages <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card hover padding="lg" className="border-[#E8D5B5] dark:border-[#3D352F]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7EBEF] dark:bg-[#722F37]/25 text-[#722F37] dark:text-[#E8A5AE] border border-[#722F37]/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">
                  Sakshatkara (Interview Practice Hub)
                </h3>
                <span className="text-xs text-[#6B5E55] dark:text-[#E8D5B5]">30+ placement questions</span>
              </div>
            </div>
            <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] leading-relaxed mb-4">
              Timed prep and speaking countdowns for Personal Intros, Behavioral STAR, Project Walkthroughs,
              and Technical Communication with filler tracking.
            </p>
            <Link to="/practice/interview" className="text-xs font-semibold text-[#C66A18] dark:text-[#D4AF65] hover:underline inline-flex items-center gap-1">
              Start Interview Simulation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </section>

      {/* College Student Value Section */}
      <section className="w-full py-16 px-4 sm:px-6 bg-[#F5EBDD]/60 dark:bg-[#201B18]/40 border-t border-[#E8D5B5] dark:border-[#3D352F]">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" size="sm">Dharma of Communication</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#201B18] dark:text-[#FFF9EF] mt-2 font-serif">
            Why Students & Engineers Excel With SpeakLab
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-left">
            <div className="p-4 rounded-xl bg-[#FFF9EF] dark:bg-[#201B18] border border-[#E8D5B5] dark:border-[#3D352F] shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-[#77764B] dark:text-[#D4AF65] mb-2" />
              <h4 className="text-sm font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">Shanti & Composure</h4>
              <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] mt-1">
                Practice in your personal space free of pressure or fear of peer judgment.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF9EF] dark:bg-[#201B18] border border-[#E8D5B5] dark:border-[#3D352F] shadow-xs">
              <Zap className="w-5 h-5 text-[#C66A18] dark:text-[#E68A24] mb-2" />
              <h4 className="text-sm font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">Measured Pacing</h4>
              <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] mt-1">
                Learn if nervousness accelerates your pace (180+ WPM) or clips ending consonants.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF9EF] dark:bg-[#201B18] border border-[#E8D5B5] dark:border-[#3D352F] shadow-xs">
              <Award className="w-5 h-5 text-[#B08930] dark:text-[#D4AF65] mb-2" />
              <h4 className="text-sm font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">Structured Clarity</h4>
              <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] mt-1">
                Every behavioral question provides concrete STAR checklists and timing targets.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF9EF] dark:bg-[#201B18] border border-[#E8D5B5] dark:border-[#3D352F] shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#C66A18] dark:text-[#D4AF65] mb-2" />
              <h4 className="text-sm font-bold text-[#201B18] dark:text-[#FFF9EF] font-serif">Sanctum Privacy</h4>
              <p className="text-xs text-[#6B5E55] dark:text-[#E8D5B5] mt-1">
                Runs completely in your browser. Audio discarded by default. No hidden cloud storage.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link to="/dashboard">
              <Button size="lg" variant="primary" iconRight={<ArrowRight className="w-4 h-4" />}>
                Enter the Practice Sanctum
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
