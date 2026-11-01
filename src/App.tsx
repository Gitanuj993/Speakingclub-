/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { UserProvider } from './contexts/UserContext';
import { Layout } from './components/layout/Layout';

import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearnHubPage } from './pages/LearnHubPage';
import { AlphabetPathPage } from './pages/AlphabetPathPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { LessonResultsPage } from './pages/LessonResultsPage';
import { InterviewPracticePage } from './pages/InterviewPracticePage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/learn" element={<LearnHubPage />} />
              <Route path="/learn/alphabet" element={<AlphabetPathPage />} />
              <Route path="/lesson/:id" element={<LessonPlayerPage />} />
              <Route path="/lesson/:id/results" element={<LessonResultsPage />} />
              <Route path="/practice/interview" element={<InterviewPracticePage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </UserProvider>
    </ToastProvider>
  );
}
