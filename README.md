# SpeakLab

> **Speak clearly. Think confidently. Interview better.**

SpeakLab is a client-side English pronunciation, articulation, and interview practice application designed for college engineering students and job seekers preparing for campus placements, technical interviews, and behavioral rounds.

Progression is inspired by TypingClub's motor-muscle memory drills, with lightweight gamification inspired by Duolingo and clean, focused Linear-style typography.

---

## 1. Quick Start & Setup

SpeakLab requires **zero external servers, zero databases, and zero API keys**. Everything executes entirely in the modern browser runtime.

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (port 3000)
npm run dev

# 3. Run automated test suite (Vitest)
npm run test

# 4. Production build
npm run build
```

---

## 2. Browser Support Matrix

| Browser | Audio Recording (`MediaRecorder`) | Speech Recognition (`SpeechRecognition`) | Speech Synthesis (Reference TTS) | IndexedDB Storage |
| :--- | :--- | :--- | :--- | :--- |
| **Google Chrome (Desktop & Mobile)** | Supported (`audio/webm`) | Supported (Web Speech API) | Supported (Natural English voices) | Supported |
| **Microsoft Edge** | Supported (`audio/webm`) | Supported (Web Speech API) | Supported | Supported |
| **Apple Safari (macOS & iOS)** | Supported (`audio/mp4`) | Partial / Vendor specific | Supported | Supported |
| **Mozilla Firefox** | Supported (`audio/ogg`) | Unsupported (Fallback: Self-Review) | Supported | Supported |

### Graceful Fallbacks:
- If `SpeechRecognition` is unavailable or declined, SpeakLab seamlessly switches to **Self-Review Mode**: the user records, replays their speech, completes a 3-point articulation checklist, and self-rates their delivery.
- If concurrent microphone access is restricted by the platform, SpeakLab prioritizes clean audio recording with live waveform feedback.

---

## 3. Privacy Architecture & Speech Recognition Disclosure

1. **Privacy by Default:** Recorded audio blobs remain solely in browser volatile memory and are discarded as soon as the user exits the drill.
2. **Opt-In Device Persistence:** Audio is only stored on disk if the user explicitly turns on *"Save Practice Audio Locally on This Device"* in Profile Settings. When enabled, audio blobs are placed in a local **IndexedDB** object store. No audio ever touches a remote server owned by SpeakLab.
3. **Web Speech API Remote Note:** In browsers like Chrome and Edge, the browser vendor may process speech audio through their vendor cloud servers to produce real-time transcripts. SpeakLab presents a transparent, one-time disclosure modal prior to first practice, letting students decline transcription and practice in complete offline privacy if desired.

---

## 4. Data Storage, Backup & Migration

- **LocalStorage (`speaklab_data_v1`):** Stores user profile, goal settings, completed exercise records, daily XP award anti-farming maps, streak timestamps, and achievements.
- **IndexedDB (`speaklab_audio_db`):** Houses user-approved audio recordings.
- **Repository Pattern (`src/services/repository.ts`):** All browser persistence is abstracted behind a clean `IRepository` interface (`LocalRepository`), enabling seamless future adapters without altering UI components.
- **Export / Import:** In `/profile`, users can download their complete history as a verified `speaklab_backup_YYYY-MM-DD.json` file and restore it on any browser.

---

## 5. Curriculum Content Structure

All educational drills reside in typed files under `src/data/`:
- **`alphabetModules.ts`:** 26 modules (Letters A to Z), each focusing on a distinct phonetic mechanism (e.g. B/P bilabial plosives, F/V voicing, L/R approximants, S/SH sibilants, T/TH alveolar-dental stops). Each module contains minimal pairs, articulation placement tips, and 3 progressive levels (Beginner, Intermediate, Advanced) for a total of **78 curated drills**.
- **`tongueTwisters.ts`:** Rapid agility gymnastics from classics to MIT's hardest twisters.
- **`readingPassages.ts`:** 12 technical and business prose passages for continuous 120–150 WPM cadence.
- **`fluencyDrills.ts`:** 12 drills covering consonant linking, contrastive stress, and executive pausing.
- **`interviewQuestions.ts`:** 30+ curated questions across 5 core placement categories (*Personal Introduction, Education & Background, Project Explanation, Technical Communication, Behavioral Questions*) with prep countdowns, speaking limits, and STAR outlines.
- **`achievements.ts`:** 10 data-driven milestones with deterministic unlock conditions.

---

## 6. Known Limitations & Honest Metrics

- **Transcription Match vs Pronunciation Score:** We label word alignment strictly as *"Transcription match, not a pronunciation score"*. Automated speech recognizers frequently autocorrect slight phoneme slips.
- **Phoneme Analysis:** Acoustic formant analysis is clearly marked as *"Coming in a future version"*. SpeakLab never invents fake scores.
- **Single Browser Scope:** Local storage is bound to the current browser profile; students should use Export JSON to move their streak to another laptop.
