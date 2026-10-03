import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import CampusPage from './pages/CampusPage';
import IssueDetailsPage from './pages/IssueDetailsPage';
import LoginPage from './pages/LoginPage';
import Signup from './pages/Signup';
import ResetPassword from './pages/Reset-Password';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/students/DashboardPage';
import ReportPage from './pages/students/ReportPage';
import ReportLocationPage from './pages/students/ReportLocationPage';
import ReportDetailsPage from './pages/students/ReportDetailsPage';
import ReportEvidencePage from './pages/students/ReportEvidencePage';
import ReportReviewPage from './pages/students/ReportReviewPage';
import ReportSuccessPage from './pages/students/ReportSuccessPage';
import ActivityPage from './pages/students/ActivityPage';
import ProfilePage from './pages/students/ProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

// Simple mock auth guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // For the frontend prototype, we'll assume logged in for testing if localStorage has 'auth'
  const isAuthenticated = localStorage.getItem('auth') === 'true';
  // If we want to strictly test, we can toggle this. For now, we'll just allow it or redirect.
  // We'll set auth=true in VerifyPage.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin auth guard
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('auth') === 'true';
  const role = localStorage.getItem('role');
  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/colleges" element={<ExplorePage />} />
            <Route path="/college/:slug" element={<CampusPage />} />
            <Route path="/issue/:id" element={<IssueDetailsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* Report Flow */}
            <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="/report/location" element={<ProtectedRoute><ReportLocationPage /></ProtectedRoute>} />
            <Route path="/report/details" element={<ProtectedRoute><ReportDetailsPage /></ProtectedRoute>} />
            <Route path="/report/evidence" element={<ProtectedRoute><ReportEvidencePage /></ProtectedRoute>} />
            <Route path="/report/review" element={<ProtectedRoute><ReportReviewPage /></ProtectedRoute>} />
            <Route path="/report/success" element={<ProtectedRoute><ReportSuccessPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
