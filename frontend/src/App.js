import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ApiTest from './components/common/ApiTest';
import PublicLayout from './components/layouts/PublicLayout';
import LandingPage from './components/pages/LandingPage';
import CoursesPage from './components/pages/CoursesPage';
import CourseDetailPage from './components/pages/CourseDetailPage';
import InstitutionsPage from './components/pages/InstitutionsPage';
import AboutPage from './components/pages/AboutPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes with layout */}
        <Route path="/" element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        } />
        <Route path="/courses" element={
          <PublicLayout>
            <CoursesPage />
          </PublicLayout>
        } />
        <Route path="/courses/:id" element={
          <PublicLayout>
            <CourseDetailPage />
          </PublicLayout>
        } />
        <Route path="/institutions" element={
          <PublicLayout>
            <InstitutionsPage />
          </PublicLayout>
        } />
        <Route path="/about" element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        } />
        
        {/* Test route */}
        <Route path="/test" element={<ApiTest />} />
        
        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === 'admin' && <AdminDashboard />}
              {user?.role === 'teacher' && <TeacherDashboard />}
              {user?.role === 'student' && <StudentDashboard />}
            </ProtectedRoute>
          }
        />
        
        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Teacher routes */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Student routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App; 