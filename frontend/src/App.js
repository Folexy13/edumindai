import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import LearningPage from './pages/LearningPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import AITutorPage from './pages/AITutorPage';
import StudentsPage from './pages/StudentsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import CreateCoursePage from './pages/CreateCoursePage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/UI/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                {/* Skip to main content link for accessibility */}
                <a 
                  href="#main-content" 
                  className="skip-link"
                  tabIndex="1"
                >
                  Skip to main content
                </a>
                
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/courses" element={
                    <ProtectedRoute>
                      <Layout>
                        <CoursesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/courses/:courseId" element={
                    <ProtectedRoute>
                      <Layout>
                        <CourseDetailsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/learning/:courseId" element={
                    <ProtectedRoute>
                      <Layout>
                        <LearningPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/ai-tutor" element={
                    <ProtectedRoute>
                      <Layout>
                        <AITutorPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/progress" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProgressPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/students" element={
                    <ProtectedRoute>
                      <Layout>
                        <StudentsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/users" element={
                    <ProtectedRoute>
                      <Layout>
                        <UsersPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/create-course" element={
                    <ProtectedRoute>
                      <Layout>
                        <CreateCoursePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 page */}
                  <Route path="*" element={
                    <Layout>
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <h1 className="text-6xl font-bold text-gray-900">404</h1>
                          <p className="text-xl text-gray-600 mt-4">Page not found</p>
                          <a 
                            href="/" 
                            className="btn btn-primary mt-8"
                            aria-label="Return to homepage"
                          >
                            Go Home
                          </a>
                        </div>
                      </div>
                    </Layout>
                  } />
                </Routes>
                
                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#10b981',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;