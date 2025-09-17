import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { BookOpen, FileText, BarChart3, Calendar } from 'lucide-react';

const StudentOverview = () => {
  const { data: enrollments, isLoading } = useQuery('studentEnrollments', async () => {
    const response = await axios.get('/api/enrollments/my_enrollments/');
    return response.data;
  });

  const cards = [
    {
      name: 'Enrolled Courses',
      value: enrollments?.length || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Study Materials',
      value: '24', // This would come from API
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Completed Exams',
      value: '8', // This would come from API
      icon: BarChart3,
      color: 'bg-yellow-500',
    },
    {
      name: 'Upcoming Exams',
      value: '2', // This would come from API
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-2 text-gray-600">Track your progress and access your learning materials.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 text-white ${card.color} p-2 rounded-lg`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                      <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">My Enrolled Courses</h3>
          <div className="space-y-4">
            {enrollments?.slice(0, 3).map((enrollment) => (
              <div key={enrollment.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{enrollment.course_title}</p>
                  <p className="text-sm text-gray-500">Progress: {enrollment.completion_percentage}%</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${enrollment.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {enrollments?.length === 0 && (
              <p className="text-gray-500 text-center py-4">No courses enrolled yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <BookOpen className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Browse Courses
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Explore available courses to enroll
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <FileText className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Study Materials
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Access your course materials
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <BarChart3 className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Take Exams
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Complete your course assessments
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview; 