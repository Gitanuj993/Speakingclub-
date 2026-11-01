/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  RotateCcw,
  Layers,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const LearnHubPage: React.FC = () => {
  const { data } = useUser();

  // Compute category progress
  const completedKeys = Object.keys(data.completedExercises);

  const alphabetCompleted = completedKeys.filter((k) => k.startsWith('alpha-')).length;
  const alphabetTotal = 26 * 3; // 78 exercises

  const twistersCompleted = completedKeys.filter((k) => k.startsWith('twister-')).length;
  const twistersTotal = 8;

  const readingCompleted = completedKeys.filter((k) => k.startsWith('reading-')).length;
  const readingTotal = 12;

  const fluencyCompleted = completedKeys.filter((k) => k.startsWith('fluency-')).length;
  const fluencyTotal = 12;

  const categories = [
    {
      id: 'alphabet',
      sanskrit: 'वर्णमाला साधना',
      title: 'Alphabet Articulation Path',
      tagline: 'Phonetic mastery for all 26 letters',
      description:
        'Targeted vocal training for bilabials, alveolar taps, velars, minimal pairs, and American rhotic /r/. 26 structured modules, all unlocked.',
      icon: <Layers className="w-6 h-6 text-[#C66A18] dark:text-[#E68A24]" />,
      color: 'kesari' as const,
      difficulty: 'All Levels Unlocked',
      completed: alphabetCompleted,
      total: alphabetTotal,
      link: '/learn/alphabet',
      cta: 'Explore 26 Letters',
    },
    {
      id: 'tongue-twisters',
      sanskrit: 'जिह्वा लाघव अभ्यास',
      title: 'Tongue Twisters & Speed Agility',
      tagline: 'Rapid speech coordination & articulation',
      description:
        'Classical and technical articulation twisters from "Unique New York" to "Pad Kid Poured Curd". Designed to untie tongue tension before interviews.',
      icon: <RotateCcw className="w-6 h-6 text-[#D4AF65]" />,
      color: 'gold' as const,
      difficulty: 'All Levels Unlocked',
      completed: twistersCompleted,
      total: twistersTotal,
      link: '/lesson/twister-1',
      cta: 'Start Twisters',
    },
    {
      id: 'reading',
      sanskrit: 'पाठ विद्या',
      title: 'Reading & Technical Prose',
      tagline: 'Engineering & systems passages',
      description:
        'Read aloud passages on system design, clean architecture, browser internals, and continuous delivery with measured 120-150 WPM pacing.',
      icon: <BookOpen className="w-6 h-6 text-[#77764B] dark:text-[#D4AF65]" />,
      color: 'gold' as const,
      difficulty: 'All Levels Unlocked',
      completed: readingCompleted,
      total: readingTotal,
      link: '/lesson/reading-1',
      cta: 'Read Passages',
    },
    {
      id: 'fluency',
      sanskrit: 'वाक् संस्कार',
      title: 'Fluency & Cadence Training',
      tagline: 'Cadence, thought grouping & intonation',
      description:
        'Drill consonant linking, contrastive stress in technical debates, executive pauses, and elevator pitches to sound natural and persuasive.',
      icon: <Sparkles className="w-6 h-6 text-[#722F37] dark:text-[#E68A24]" />,
      color: 'kesari' as const,
      difficulty: 'All Levels Unlocked',
      completed: fluencyCompleted,
      total: fluencyTotal,
      link: '/lesson/fluency-1',
      cta: 'Train Fluency',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="gold" size="sm">ज्ञान मार्ग • Curriculum Hub</Badge>
          <Badge variant="success" size="sm">All Exercises Unlocked</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] tracking-tight mt-1.5">
          Speaking Practice Categories
        </h1>
        <p className="text-xs sm:text-sm text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-1 max-w-2xl">
          Progressive drills for vocal tract flexibility, phonetic precision, reading cadence, and technical speaking. All modules are unlocked and available to explore freely.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const percent = Math.round((cat.completed / cat.total) * 100);
          return (
            <Card
              key={cat.id}
              hover
              padding="lg"
              className="flex flex-col justify-between border-[#E8D5B5] dark:border-[#3D352F] hover:border-[#D4AF65] dark:hover:border-[#D4AF65]/60 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8D5B5]/40 dark:bg-[#28211D] border border-[#D4AF65]/40 flex items-center justify-center shrink-0">
                    {cat.icon}
                  </div>
                  <Badge variant="outline" size="sm">{cat.difficulty}</Badge>
                </div>

                <div className="text-[11px] font-serif font-semibold text-[#C66A18] dark:text-[#E68A24] tracking-wider uppercase">
                  {cat.sanskrit}
                </div>
                <h2 className="text-lg font-serif font-bold text-[#201B18] dark:text-[#FFF9EF] mt-0.5">
                  {cat.title}
                </h2>
                <p className="text-xs font-medium text-[#722F37] dark:text-[#E8D5B5] mt-0.5">
                  {cat.tagline}
                </p>
                <p className="text-xs text-[#201B18]/75 dark:text-[#E8D5B5]/75 mt-2.5 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8D5B5]/60 dark:border-[#3D352F] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#722F37] dark:text-[#E8D5B5]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#77764B] dark:text-[#D4AF65]" />
                    <span>{cat.completed} of {cat.total} completed</span>
                  </span>
                  <span className="font-mono font-medium text-[#C66A18] dark:text-[#E68A24]">{percent}%</span>
                </div>
                <ProgressBar value={percent} color={cat.color} size="sm" />

                <div className="pt-2">
                  <Link to={cat.link} className="w-full block">
                    <Button
                      variant={cat.completed > 0 ? 'secondary' : 'primary'}
                      size="md"
                      className="w-full justify-between"
                      iconRight={<ArrowRight className="w-4 h-4" />}
                    >
                      {cat.completed > 0 ? `Continue Practice` : cat.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
