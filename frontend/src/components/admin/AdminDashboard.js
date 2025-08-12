import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, BookOpen, GraduationCap, FileText, 
  DollarSign, BarChart3, Settings, LogOut, Menu, X,
  Shield, Database, Activity, Calendar, Bell, 
  TrendingUp, UserCheck, BookMarked, CreditCard
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import FeeManagement from './FeeManagement';
import Reports from './Reports';
import ExamManagement from './ExamManagement';
import TeacherSalaryManagement from './TeacherSalaryManagement';
import SystemSettings from './SystemSettings';
import Analytics from './Analytics';
import Notifications from './Notifications';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Exams', href: '/admin/exams', icon: FileText },
    { name: 'Fees', href: '/admin/fees', icon: DollarSign },
    { name: 'Teacher Salaries', href: '/admin/salaries', icon: CreditCard },
    { name: 'Reports', href: '/admin/reports', icon: TrendingUp },
    { name: 'Analytics', href: '/admin/analytics', icon: Activity },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
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
            <div className="flex-1 flex items-center">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Full System Control Panel</p>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500">Super Administrator</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
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
                <Route path="/" element={<AdminOverview />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/courses" element={<CourseManagement />} />
                <Route path="/exams" element={<ExamManagement />} />
                <Route path="/fees" element={<FeeManagement />} />
                <Route path="/salaries" element={<TeacherSalaryManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<SystemSettings />} />
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
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary-600" />
          <div className="ml-2">
            <h1 className="text-xl font-semibold text-gray-900">EduPortal</h1>
            <p className="text-xs text-gray-500">Admin Control</p>
          </div>
        </div>
      </div>
      <nav className="mt-8 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              {item.name}
            </a>
          );
        })}
      </nav>
    </div>
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <div className="flex items-center w-full">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-primary-600" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-gray-700">{user?.first_name} {user?.last_name}</div>
          <div className="text-xs text-gray-500">Super Administrator</div>
        </div>
      </div>
    </div>
  </>
);

export default AdminDashboard; 