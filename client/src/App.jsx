import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchTutors } from './store/slices/tutorsSlice';
import { fetchSiteSettings } from './store/slices/settingsSlice';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import TutorDetailsPage from './pages/TutorDetailsPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TutorDashboardPage from './pages/TutorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HowItWorksPage from './pages/HowItWorksPage';
import StudentAuthPage from './pages/StudentAuthPage';
import TutorAuthPage from './pages/TutorAuthPage';
import AdminAuthPage from './pages/AdminAuthPage';
import AuthPage from './pages/AuthPage';
import TutorResponsibilityPolicyPage from './pages/TutorResponsibilityPolicyPage';
import TutorGuidelinesPage from './pages/TutorGuidelinesPage';
import TutorFaqPage from './pages/TutorFaqPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';

// Scroll to top on route change or search query change
function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash]);
  return null;
}

export default function App() {
  const dispatch = useDispatch();

  // Load live tutor data and site CMS settings from MongoDB database on application start
  useEffect(() => {
    dispatch(fetchTutors());
    dispatch(fetchSiteSettings());
  }, [dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-warm-50 text-stone-800 selection:bg-brand-200 selection:text-brand-900">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public Informational & Policy Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/tutors/:id" element={<TutorDetailsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />

            {/* Responsibility & Liability Policy (all aliases) */}
            <Route path="/tutor-responsibility-policy" element={<TutorResponsibilityPolicyPage />} />
            <Route path="/tutor/responsibility-policy" element={<TutorResponsibilityPolicyPage />} />
            <Route path="/responsibility-policy" element={<TutorResponsibilityPolicyPage />} />

            {/* Safety & Conduct Guidelines (all aliases) */}
            <Route path="/tutor-guidelines" element={<TutorGuidelinesPage />} />
            <Route path="/tutor/guidelines" element={<TutorGuidelinesPage />} />
            <Route path="/safety-guidelines" element={<TutorGuidelinesPage />} />

            {/* FAQ (all aliases) */}
            <Route path="/tutor-faq" element={<TutorFaqPage />} />
            <Route path="/tutor/faq" element={<TutorFaqPage />} />
            <Route path="/faq" element={<TutorFaqPage />} />

            {/* Terms and Conditions (all aliases) */}
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/terms" element={<TermsAndConditionsPage />} />
            <Route path="/terms-of-service" element={<TermsAndConditionsPage />} />
            <Route path="/t-and-c" element={<TermsAndConditionsPage />} />
            <Route path="/tc" element={<TermsAndConditionsPage />} />

            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Student & Parent Auth Routes */}
            <Route
              path="/student/login"
              element={
                <PublicOnlyRoute role="student">
                  <StudentAuthPage initialMode="login" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/student/register"
              element={
                <PublicOnlyRoute role="student">
                  <StudentAuthPage initialMode="register" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/student/auth"
              element={
                <PublicOnlyRoute role="student">
                  <StudentAuthPage />
                </PublicOnlyRoute>
              }
            />

            {/* Tutor / Educator Auth Routes */}
            <Route
              path="/tutor/login"
              element={
                <PublicOnlyRoute role="tutor">
                  <TutorAuthPage initialMode="login" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/tutor/register"
              element={
                <PublicOnlyRoute role="tutor">
                  <TutorAuthPage initialMode="register" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/tutor/auth"
              element={
                <PublicOnlyRoute role="tutor">
                  <TutorAuthPage />
                </PublicOnlyRoute>
              }
            />

            {/* Admin Auth Route */}
            <Route
              path="/admin/login"
              element={
                <PublicOnlyRoute role="admin">
                  <AdminAuthPage />
                </PublicOnlyRoute>
              }
            />

            {/* Role-Protected Dashboards with Automatic RBAC */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <TutorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/portal"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Direct CMS Portal Access Routes */}
            <Route
              path="/admin/cms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage initialTab="settings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage initialTab="settings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/website-cms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage initialTab="settings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage initialTab="settings" />
                </ProtectedRoute>
              }
            />

            {/* Universal Entrypoints */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <AuthPage initialMode="login" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <StudentAuthPage initialMode="register" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute>
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />

            {/* Fallback Catch-All Route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
