import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = ({ user }) => {
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      // Mock admin stats - in real app, you'd have admin-specific endpoints
      setStats({
        totalUsers: 1234,
        totalCourses: 89,
        totalLessons: 567,
        systemUptime: '99.9%',
        activeUsers: 234,
        newUsersToday: 12,
        coursesPublishedToday: 3,
        systemAlerts: 2
      });

      setSystemHealth([
        { name: 'Database', status: 'healthy', uptime: '99.9%' },
        { name: 'API Server', status: 'healthy', uptime: '99.8%' },
        { name: 'File Storage', status: 'warning', uptime: '98.5%' },
        { name: 'Background Jobs', status: 'healthy', uptime: '99.7%' }
      ]);
      
      announce('Admin dashboard loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      announce('Failed to load some dashboard data, but you can still navigate the platform');
      
      // Set fallback data
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        systemUptime: '100%',
        activeUsers: 0,
        newUsersToday: 0,
        coursesPublishedToday: 0,
        systemAlerts: 0
      });
      setSystemHealth([]);
    } finally {
      setLoading(false);
    }
  }, [announce]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ServerIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard, {user.firstName}! 👑
        </h1>
        <p className="text-indigo-100">
          Monitor and manage the EduMind AI platform. Keep everything running smoothly!
        </p>
      </div>

      {/* System Alerts */}
      {stats?.systemAlerts > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have {stats.systemAlerts} system alert(s) that need attention.
              </p>
              <div className="mt-2">
                <Link to="/settings" className="text-sm font-medium text-yellow-700 underline">
                  View alerts →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalCourses || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.activeUsers || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Uptime</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.systemUptime || '100%'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Today's Activity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">New Users</p>
                  <p className="text-2xl font-bold text-blue-900">{stats?.newUsersToday || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">Courses Published</p>
                  <p className="text-2xl font-bold text-green-900">{stats?.coursesPublishedToday || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Lessons Completed</p>
                  <p className="text-2xl font-bold text-purple-900">{stats?.totalLessons || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/users"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors group"
            >
              <UsersIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                  Manage Users
                </h4>
                <p className="text-xs text-gray-500">View all users</p>
              </div>
            </Link>
            
            <Link
              to="/courses"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors group"
            >
              <BookOpenIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                  Manage Courses
                </h4>
                <p className="text-xs text-gray-500">Review all courses</p>
              </div>
            </Link>
            
            <Link
              to="/progress"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors group"
            >
              <ChartBarIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                  View Analytics
                </h4>
                <p className="text-xs text-gray-500">Platform metrics</p>
              </div>
            </Link>
            
            <Link
              to="/settings"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors group"
            >
              <CogIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                  System Settings
                </h4>
                <p className="text-xs text-gray-500">Configure platform</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            {systemHealth.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(service.status)}
                  <span className="ml-3 text-sm font-medium text-gray-900">{service.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Uptime: {service.uptime}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : service.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;