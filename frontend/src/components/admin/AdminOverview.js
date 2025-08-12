import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from '../../utils/api';
import { 
  Users, BookOpen, DollarSign, GraduationCap, 
  TrendingUp, TrendingDown, Activity, Clock,
  AlertCircle, CheckCircle, XCircle, Info
} from 'lucide-react';

const AdminOverview = () => {
  const [timeRange, setTimeRange] = useState('7');

  const { data: stats, isLoading } = useQuery('adminStats', async () => {
    const response = await axios.get('/api/admin/stats/');
    return response.data;
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['adminAnalytics', timeRange],
    async () => {
      const response = await axios.get(`/api/admin/analytics/?days=${timeRange}`);
      return response.data;
    }
  );

  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    'adminRecentActivity',
    async () => {
      const response = await axios.get('/api/admin/recent_activity/');
      return response.data;
    }
  );

  const cards = [
    {
      name: 'Total Users',
      value: stats?.total_users || 0,
      change: analytics?.enrollment_change || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up',
    },
    {
      name: 'Active Courses',
      value: stats?.active_courses || 0,
      change: analytics?.course_change || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      trend: 'up',
    },
    {
      name: 'Total Revenue',
      value: `$${stats?.total_revenue?.toLocaleString() || 0}`,
      change: analytics?.revenue_change || 0,
      icon: DollarSign,
      color: 'bg-yellow-500',
      trend: 'up',
    },
    {
      name: 'Student Retention',
      value: `${analytics?.retention_rate || 0}%`,
      change: analytics?.retention_change || 0,
      icon: GraduationCap,
      color: 'bg-purple-500',
      trend: 'up',
    },
  ];

  const getStatusIcon = (type) => {
    switch (type) {
      case 'enrollment':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'transaction':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'course':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'enrollment':
        return 'bg-blue-100';
      case 'transaction':
        return 'bg-green-100';
      case 'course':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (isLoading || analyticsLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-2 text-gray-600">Welcome to the admin dashboard. Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;
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
                      <dd className="flex items-center text-sm">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(card.change)}%
                        </span>
                        <span className="text-gray-500 ml-1">from last period</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Students</span>
              <span className="text-sm font-medium text-gray-900">{stats?.total_students || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Teachers</span>
              <span className="text-sm font-medium text-gray-900">{stats?.total_teachers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Admins</span>
              <span className="text-sm font-medium text-gray-900">{(stats?.total_users || 0) - (stats?.total_students || 0) - (stats?.total_teachers || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Courses</span>
              <span className="text-sm font-medium text-gray-900">{stats?.active_courses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Courses</span>
              <span className="text-sm font-medium text-gray-900">{stats?.total_courses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Enrollment Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.total_courses > 0 ? Math.round((stats?.recent_enrollments / stats?.total_courses) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-medium text-gray-900">${stats?.total_revenue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recent Transactions</span>
              <span className="text-sm font-medium text-gray-900">{stats?.recent_transactions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue Growth</span>
              <span className={`text-sm font-medium ${analytics?.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics?.revenue_change >= 0 ? '+' : ''}{analytics?.revenue_change || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`flex-shrink-0 ${getStatusColor(activity.type)} rounded-full p-2`}>
                  {getStatusIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">System Online</p>
                <p className="text-xs text-gray-500">All services operational</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Connected and healthy</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Uptime</p>
                <p className="text-xs text-gray-500">99.9% this month</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Alerts</p>
                <p className="text-xs text-gray-500">2 pending notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Add New User
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new student or teacher account
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <BookOpen className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Create Course
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Set up a new course with materials
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <TrendingUp className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check financial and enrollment reports
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview; 