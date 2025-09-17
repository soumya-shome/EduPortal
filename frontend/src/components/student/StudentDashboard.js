import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, FileText, Users, BarChart3, 
  Settings, LogOut, Menu, X, GraduationCap, Calendar 
} from 'lucide-react';
import StudentOverview from './StudentOverview';
import MyCourses from './MyCourses';
import StudyMaterials from './StudyMaterials';
import Exams from './Exams';
import CourseCatalog from './CourseCatalog';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/student', icon: BarChart3 },
    { name: 'My Courses', href: '/student/courses', icon: BookOpen },
    { name: 'Study Materials', href: '/student/materials', icon: FileText },
    { name: 'Exams', href: '/student/exams', icon: FileText },
    { name: 'Course Catalog', href: '/student/catalog', icon: BookOpen },
    { name: 'Schedule', href: '/student/schedule', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} logout={logout} user={user} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent navigation={navigation} logout={logout} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <h1 className="text-2xl font-semibold text-gray-900 my-auto">Student Dashboard</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.first_name}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<StudentOverview />} />
                <Route path="/courses" element={<MyCourses />} />
                <Route path="/materials" element={<StudyMaterials />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/catalog" element={<CourseCatalog />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, logout, user }) => (
  <>
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <GraduationCap className="h-8 w-8 text-primary-600" />
        <h1 className="ml-2 text-xl font-semibold text-gray-900">EduPortal</h1>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <Icon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
              {item.name}
            </a>
          );
        })}
      </nav>
    </div>
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <div className="flex items-center">
        <div>
          <div className="text-sm font-medium text-gray-700">{user?.first_name} {user?.last_name}</div>
          <div className="text-xs text-gray-500">{user?.role}</div>
        </div>
      </div>
    </div>
  </>
);

export default StudentDashboard; 