import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from '../../utils/api';
import { 
  TrendingUp, TrendingDown, Users, BookOpen, 
  DollarSign, Calendar, BarChart3, PieChart,
  Activity, Target, Award, Clock
} from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('enrollments');

  const { data: analytics, isLoading } = useQuery(
    ['adminAnalytics', timeRange],
    async () => {
      const response = await axios.get(`/api/admin/analytics/?days=${timeRange}`);
      return response.data;
    }
  );

  const metrics = [
    {
      name: 'Total Enrollments',
      value: analytics?.total_enrollments || 0,
      change: analytics?.enrollment_change || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Revenue Generated',
      value: `$${analytics?.total_revenue || 0}`,
      change: analytics?.revenue_change || 0,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Active Courses',
      value: analytics?.active_courses || 0,
      change: analytics?.course_change || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      name: 'Student Retention',
      value: `${analytics?.retention_rate || 0}%`,
      change: analytics?.retention_change || 0,
      icon: Target,
      color: 'bg-yellow-500',
    },
  ];

  const chartData = [
    { month: 'Jan', enrollments: 65, revenue: 12000 },
    { month: 'Feb', enrollments: 78, revenue: 15000 },
    { month: 'Mar', enrollments: 90, revenue: 18000 },
    { month: 'Apr', enrollments: 85, revenue: 17000 },
    { month: 'May', enrollments: 95, revenue: 19000 },
    { month: 'Jun', enrollments: 110, revenue: 22000 },
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
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">Advanced insights and performance metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
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
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          return (
            <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 text-white ${metric.color} p-2 rounded-lg`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{metric.name}</dt>
                      <dd className="text-lg font-medium text-gray-900">{metric.value}</dd>
                      <dd className="flex items-center text-sm">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(metric.change)}%
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Trends</h3>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(data.enrollments / 110) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{data.enrollments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(data.revenue / 22000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">${data.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Peak Enrollment Time</p>
              <p className="text-sm text-gray-500">September - December</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Top Performing Course</p>
              <p className="text-sm text-gray-500">Web Development Fundamentals</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Average Session Duration</p>
              <p className="text-sm text-gray-500">45 minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Generate Report</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <PieChart className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Export Data</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">View Trends</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 