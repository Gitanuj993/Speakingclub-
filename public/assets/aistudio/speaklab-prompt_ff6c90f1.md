# Build SpeakLab: a client-side English Speaking & Interview Practice App

## Role
Act as a senior product designer, UX architect and front-end engineer. Build a production-quality, **fully client-side** MVP of SpeakLab. There is no backend, no database, no authentication and no network calls to first-party services. Everything runs in the browser and persists locally.

## 1. Product
- **Name:** SpeakLab
- **Tagline:** Speak clearly. Think confidently. Interview better.
- **What it is:** Structured speaking practice for college students preparing for placements, internships and technical/HR interviews. Progression is inspired by TypingClub (paths, lessons, levels), with lightweight motivation inspired by Duolingo and a clean Linear-style UI.
- **Focus:** pronunciation and articulation drills (tongue twisters as the entry point), reading and fluency practice, and interview answers. Not a generic language-learning app.
- **Language:** English only. **Platform:** responsive web (desktop, tablet, mobile).

## 2. Hard constraints (non-negotiable)
1. **Client-side only.** No FastAPI, Supabase, Firebase, auth, or any server. No API keys. No `.env` required.
2. **Privacy by default.** Recorded audio stays in memory and is discarded when the user leaves the exercise unless they explicitly tick "Save this recording on this device". Saved audio goes to IndexedDB only.
3. **Honest feedback.** Never present speech-to-text accuracy as pronunciation accuracy. Never fabricate scores. Anything not measurable is shown as "Not available in this version", not invented.
4. **No dead UI.** Every visible control works, or is not rendered. No `alert()`/`confirm()`; use toasts and accessible modal dialogs.
5. **Minimal dependencies.** Allowed: React, React DOM, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Motion (Framer Motion). Dev only: Vitest, Testing Library, ESLint, Prettier. Anything else needs a one-line justification in the README.

## 3. Tech stack
React 18 + TypeScript (strict) + Vite, Tailwind CSS, React Router (hash or browser router with SPA fallback documented), Lucide React, Motion. State via React Context + `useReducer`. Browser APIs: `MediaRecorder`, `getUserMedia`, HTML Audio, `SpeechSynthesis`, `SpeechRecognition`/`webkitSpeechRecognition` (feature-detected), IndexedDB, `localStorage`.

## 4. Browser-only technical decisions

**Reference audio.** There are no hosted audio files. Use the browser `speechSynthesis` API to read each exercise aloud, with a speed control (0.6x, 0.8x, 1x). Pick an `en-*` voice if available. If no voices exist, hide the play button and show a short explanation. Model audio as `ReferenceAudio { type: 'tts' | 'file'; rate; voiceHint }` so static audio files could be added later without refactoring.

**Speech recognition and privacy.** In Chrome and Edge, `SpeechRecognition` typically sends audio to the browser vendor's servers. Before the first use, show a one-time consent dialog stating this plainly, with "Enable transcription" and "Practice without transcription" options. Store the choice in settings and allow changing it in `/profile`. If unsupported (for example Firefox), show a clear notice and offer the fallback: record, replay, self-review checklist and a manual self-rating. Do not claim transcription works everywhere.

**Recording and recognition together.** Run `MediaRecorder` and `SpeechRecognition` in parallel on the same attempt, and handle the case where the browser refuses concurrent mic access (fall back to recording only, with a message).

**Persistence.**
- `localStorage`: profile, settings, progress, streak, XP, achievements, attempt metadata. Version the schema (`schemaVersion`) and write a migration function.
- IndexedDB: only user-approved audio blobs.
- Wrap all storage in a `Repository` interface (`getProfile`, `saveAttempt`, and so on) with a single `LocalRepository` implementation. This keeps components independent from storage and lets a remote backend be added later without rewriting the UI.
- Handle storage failures (quota, private mode) with an error toast and in-memory fallback.
- Provide **Export progress (JSON)**, **Import progress** (validated) and **Reset all data** (confirmation dialog) in `/profile`.
- State clearly in the UI that progress lives in this browser only and does not sync across devices or survive clearing site data. Export/import is the backup path.

## 5. Design
Clean, modern, professional educational SaaS. Minimal, rounded cards, consistent spacing, one accent color plus neutrals, subtle motion, strong typographic hierarchy, WCAG AA contrast, light and dark themes (system default, user override). Avoid heavy gradients, decorative illustrations, crowded dashboards and childish gamification.

Create a small design system first: color and spacing tokens in the Tailwind config, type scale, Button (primary, secondary, ghost, danger), Card, ProgressBar, ProgressRing, Badge, Toast, Modal, Tabs, EmptyState, ErrorState, Skeleton.

## 6. Routes and pages

| Route | Purpose |
|---|---|
| `/` | Landing: hero with tagline and **Start Practicing** CTA, how it works (3 steps), learning pillars, features, sample progression, interview section, student benefits, footer. Value must be clear in a few seconds. |
| `/onboarding` | Optional, skippable, 4 short steps: name (optional), primary goal (Interview preparation, Pronunciation, Speaking fluency, Overall communication), self-perceived proficiency, main area to improve. Skipping creates a default guest profile. Never block practice behind it. |
| `/dashboard` | Welcome, **Continue Practicing** as the dominant action, daily goal progress, streak, XP and level, lessons completed, recommended exercises (rule-based on goal and weak areas), quick link to interview practice, daily challenge. |
| `/learn` | Four category cards (Tongue Twisters, Pronunciation, Reading Practice, Fluency Training) with description, progress, difficulty range and Start/Continue. |
| `/learn/alphabet` | 26 modules in a responsive grid: letter, phonetic focus, completion %, levels available, locked/unlocked. |
| `/lesson/:id` | Distraction-free lesson player (section 8). |
| `/lesson/:id/results` | Feedback report (section 9). |
| `/practice/interview` | Interview hub with 5 categories, question list, practice flow and history (section 10). |
| `/progress` | Real analytics only (section 11). |
| `/profile` | Profile, goals, proficiency, daily target, theme, microphone and transcription settings, recording privacy, data export/import/reset. |
| `*` | Friendly 404 with navigation back. |

Include responsive navigation: sidebar on desktop, bottom tab bar on mobile. Use a skip-to-content link.

## 7. Curriculum content
Keep all content in typed data files under `src/data/`, never inside components. Validate content at build/test time (unique IDs, every module has all three levels, no empty fields).

**Alphabet path.** 26 modules, one per letter, each with a phonetic focus and not merely "words starting with the letter". Examples: B/P bilabial stops and aspiration; F/V voicing; L and R articulation; S/SH sibilants; T/TH alveolar versus dental; plus vowels, W/V, J/Y/Z, clusters and others as appropriate. Each module has a `focus`, `minimalPairs`, `articulationTip` and exercises at three levels.

**Levels.**
- Beginner: short phrases, slow rate, 3 repetitions.
- Intermediate: longer sentences, harder transitions, 5 repetitions, timed.
- Advanced: full tongue twisters, controlled speed targets, multiple repetitions, fluency check.

**Volume.** At least **78 curated exercises** (3 per letter module) with tongue twisters, plus at least 12 reading passages (the Reading Practice category) and 12 fluency drills (the Fluency Training category). Each exercise: `id`, `moduleId`, `level`, `text`, `targetSounds`, `objective`, `repetitionsRequired`, `targetWpmRange` (advanced), `tip`. Do not write exercises that are merely repeated words.

**Unlock rules.** Module A is open. A module unlocks when the previous module has at least one completed Beginner exercise. Levels unlock sequentially inside a module. Explain the lock reason on locked cards. Provide a "Skip ahead" option in settings for users who want everything open.

## 8. Lesson player (`/lesson/:id`)
Show: module and lesson name, level selector, exercise n of N, objective, the text (large, readable, with target sounds subtly highlighted), reference audio with speed control, record button, live duration, repeat counter, completion status.

Flow: Read → Listen → Record → Stop → Review (replay) → Analyze → Feedback → Retry or Complete → Next.

**Recorder requirements.**
- Permission request with a pre-prompt explanation. Handle denied, dismissed, no device, device busy, insecure context (needs HTTPS or localhost), unsupported browser.
- Clear recording indicator (not color alone) with `aria-live` announcements, live timer, max duration with auto-stop.
- Stop, replay, retry, discard.
- Always stop all `MediaStreamTrack`s and recognition sessions on stop, route change and unmount. Revoke object URLs.
- Pick a supported MIME type via `MediaRecorder.isTypeSupported` (Safari support differs from Chrome).
- Handle the page being hidden or the tab closing mid-recording.

**Completion rule.** An exercise counts as complete only when the user has finished the required number of valid repetitions. A valid repetition is a recording at least 1.5 seconds long and, where transcription is available, with a transcript of at least 50% of expected words matched; without transcription it counts if the user confirms it with a self-check. Debounce and de-duplicate so clicking repeatedly cannot award XP.

## 9. Feedback (`/lesson/:id/results`)
Separate the report into labelled sections:

1. **Transcription match** (only if transcription ran): your transcript versus expected text, word-level alignment (matched, missing, substituted, extra) using a normalized (lowercase, punctuation-stripped) Levenshtein/diff algorithm, and match percentage. Label it "Transcription match, not a pronunciation score". Note that recognizers often auto-correct mispronunciations.
2. **Pace:** duration and estimated WPM (words in expected text ÷ speaking duration), compared with the target range. Clearly label it an estimate.
3. **Fluency indicators** (only what is measurable): total duration versus expected, and, if timestamps are available, long pauses. Do not infer more.
4. **Pronunciation and phoneme analysis:** shown as a disabled "Coming in a future version" panel. Never display fake phoneme scores.
5. **Practice suggestions:** rule-based tips from the exercise's `targetSounds`, the words that were missed and the pace result (for example "slow down to 80%", "isolate /θ/ with minimal pairs"). Mark them as general guidance, not personalized AI analysis.
6. **Self-review:** a 3-item checklist and a 1–5 self-rating, stored with the attempt.

Actions: Retry, Next exercise, Back to module. Unit-test the alignment, WPM and normalization functions.

## 10. Interview practice (`/practice/interview`)
Five categories: Personal Introduction, Education and Background, Project Explanation, Technical Communication, Behavioral Questions.

At least **30 curated questions** (at least 5 per category). Each has `id`, `question`, `category`, `difficulty`, `prepSeconds`, `speakSeconds`, `instructions`, `framework` (for example STAR for behavioral questions) and `sampleStructure` (an outline, not a script). "Tell me about yourself" defaults to 30 s prep and 90 s speaking.

**Flow:** question screen → countdown prep timer (skippable) → record with countdown to the speaking limit → stop → review → transcript (if available) → basic communication feedback → retry or finish.

**Feedback is basic and rule-based only:** duration versus target, WPM, filler-word count from the transcript (um, uh, like, you know, basically, and so on), a lengthy-answer or short-answer flag, and the framework checklist for self-review. No AI evaluation and no invented scores.

**History:** list of attempts with date, question, duration, WPM, filler count, optional saved audio (only if the user opted in), the transcript and self-notes. Allow filtering by category, viewing details, and deleting individual attempts or all attempts through a confirmation dialog.

## 11. Progress (`/progress`)
Real data only, computed from stored attempts: total practice time, exercises completed, current and longest streak, weekly activity chart (last 7 days), per-module progress, WPM history, previous attempts, interview history.

**Skill panel.** Show only what can be grounded in data: **Pacing** (from WPM versus targets), **Transcription match trend** (average match per target sound), **Consistency** (practice days), **Interview communication** (from the attempts' duration, WPM and filler trend), and the user's own **self-ratings**. Do not draw Articulation or Pronunciation scores without a real source. Show "Not enough data yet" until the minimum number of attempts exists (at least 3). Charts are hand-built SVG or CSS, with no chart library, and keyboard- and screen-reader-accessible (text alternatives or a data table toggle).

## 12. Gamification
- **XP:** completed exercise (Beginner 10, Intermediate 20, Advanced 30), plus a small bonus for a personal-best pace; completed interview attempt 25. XP for a given exercise is awarded once per day per level (re-practice earns no XP but still counts as practice time), preventing farming.
- **Streak:** based on the user's local calendar date; at least one valid completed activity per day. One "streak freeze" per week is optional. Handle timezone and daylight saving changes, and clock changes backward gracefully.
- **Levels:** documented XP thresholds (for example level n needs 100·n² cumulative XP).
- **Achievements** (data-driven, each with an unlock condition function): First Recording, First Lesson Completed, 7-Day Streak, 25 Exercises Completed, Interview Explorer (one attempt in every category), Personal Best, plus at least 4 more. Show locked achievements with their criteria.
- **Daily challenge:** one deterministic, date-seeded challenge (for example "complete 2 exercises focusing on /r/"), identical for all users on a given day.
- **Tone:** adult and professional; no mascots, no childish animations. Respect `prefers-reduced-motion`.

## 13. Data models (`src/types/`)
`UserProfile`, `Settings`, `LearningModule`, `Lesson`, `Exercise`, `ReferenceAudio`, `PracticeSession`, `SpeechResult` (with optional `transcript`, `wordAlignment`, `matchPercent`, `wpm`, `durationMs`, and `phonemeAnalysis: null` reserved), `InterviewQuestion`, `InterviewAttempt`, `UserProgress`, `Achievement`, `StoredData` (the versioned root). Use explicit types, discriminated unions for states (for example `RecorderState`), and no `any`.

## 14. Accessibility
Semantic landmarks and headings, keyboard-operable everything with visible focus rings, labelled form controls, focus trapping and restoration in modals, `aria-live` for recording state and toasts, text alternatives for charts, color is never the only signal, touch targets ≥ 44 px, `prefers-reduced-motion` and `prefers-color-scheme` support, and 200% zoom without loss of function.

## 15. Architecture
```
src/
  components/{common,layout,dashboard,learning,lesson,audio,interview,progress}/
  pages/            one file per route (+ NotFoundPage)
  data/             alphabetModules.ts, tongueTwisters.ts, readingPassages.ts,
                    fluencyDrills.ts, interviewQuestions.ts, achievements.ts
  hooks/            useAudioRecorder, useSpeechRecognition, useSpeechSynthesis,
                    useProgress, useCountdown, useToast
  services/         audioService, analysisService, progressService,
                    repository (interface + LocalRepository)
  contexts/         UserContext, ProgressContext, ToastContext
  types/
  utils/            scoring, alignment, storage, dates, xp
  App.tsx, main.tsx
```
Keep content, state and UI separated. No logic duplicated between lesson and interview flows; share the recorder and analysis modules.

## 16. Quality and testing
- Unit tests (Vitest) for: word alignment, normalization, WPM, filler counting, XP and level calculation, streak logic (including day boundaries), unlock rules, storage migration, import validation, content validation.
- Component tests for the recorder state machine with mocked `MediaRecorder`/`getUserMedia`/`SpeechRecognition`, covering permission denied, no device, unsupported and cleanup on unmount.
- Manually verify the full journey in Chrome (desktop and mobile emulation) and Safari or Firefox for the fallback paths.
- Zero console errors or warnings, no broken routes, `tsc --noEmit` and ESLint clean, production build succeeds, Lighthouse accessibility score ≥ 95 on the landing page and lesson player.
- Loading, empty and error states exist for every data-dependent view.

## 17. Acceptance criteria
1. A new visitor understands the product from the landing page and reaches a first exercise in two clicks without signing up.
2. Onboarding can be completed or skipped; skipping leaves a working guest profile.
3. The dashboard shows real values (zeros and empty states for a new user, never fake data).
4. All 26 alphabet modules are browsable with correct lock states and three selectable levels.
5. At least 78 alphabet exercises, 12 reading passages, 12 fluency drills and 30 interview questions exist and pass content validation.
6. Reference audio plays through speech synthesis with speed control, or degrades with a message.
7. A user can record, replay, retry and discard; streams are released every time.
8. Transcription works where supported, after the consent dialog, and degrades honestly where not.
9. The results page keeps transcription match, pace, fluency indicators and the unavailable phoneme analysis visibly separate, with no fabricated scores.
10. Completion, XP, level, streak, achievements and daily challenge update correctly and cannot be farmed by repeated clicks.
11. Interview practice supports prep timer, timed recording, transcript review, basic feedback, retry and a filterable history.
12. `/progress` shows only real data with proper empty states.
13. All data survives a refresh; export, import and reset work and are validated.
14. Works at 360 px, 768 px and 1280 px widths; navigation adapts.
15. Every error path (permission, device, storage, unsupported API, invalid import) shows a clear, actionable message.

## 18. Process
1. Inspect the existing project and keep working configs; do not replace them unnecessarily.
2. Build in this order: design system and layout → types, content data and repository → recorder, speech and analysis modules with tests → lesson player and results → alphabet and learning hub → dashboard, gamification and progress → interview practice → profile, export/import → accessibility and polish.
3. Test each stage before moving on, then run the complete journey: Discover → Practice → Record → Feedback → Improve → Interview → Track progress.
4. Deliver a README covering: setup (`npm install`, `npm run dev`, `npm run build`, `npm test`), browser support matrix, the speech-recognition privacy note, data storage and backup, content authoring guide, and known limitations. No `.env.example` is needed, since no environment variables are used.

**Principle:** reliability and honesty over feature count. Every feature should help a student communicate more clearly in a real interview.
