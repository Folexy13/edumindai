import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import api from '../../services/api';
import {
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const TeacherDashboard = ({ user }) => {
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // For teachers, we'll fetch courses they created
      const coursesResponse = await api.learning.getMyCourses();
      const teacherCourses = coursesResponse.data.courses?.filter(course => course.creatorId === user.id) || [];
      
      setMyCourses(teacherCourses.slice(0, 4));
      
      // Calculate teacher stats
      const totalStudents = teacherCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
      const totalCourses = teacherCourses.length;
      const publishedCourses = teacherCourses.filter(course => course.isPublished).length;
      
      setStats({
        totalCourses,
        publishedCourses,
        totalStudents,
        avgRating: teacherCourses.length > 0 
          ? (teacherCourses.reduce((sum, course) => sum + (course.rating || 4.5), 0) / teacherCourses.length).toFixed(1)
          : 4.5
      });
      
      announce('Teacher dashboard loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      announce('Failed to load some dashboard data, but you can still navigate the platform');
      
      // Set fallback data
      setStats({
        totalCourses: 0,
        publishedCourses: 0,
        totalStudents: 0,
        avgRating: 4.5
      });
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, Professor {user.firstName}! 👨‍🏫
        </h1>
        <p className="text-green-100">
          Shape minds, inspire learning. Your courses are making a difference!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon className="h-8 w-8 text-blue-400" />
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
              <DocumentTextIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.publishedCourses || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Students</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalStudents || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.avgRating || '4.5'} ⭐</dd>
              </dl>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/courses/create"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors group"
            >
              <PlusIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                  Create New Course
                </h4>
                <p className="text-xs text-gray-500">Start building your next course</p>
              </div>
            </Link>
            
            <Link
              to="/students"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors group"
            >
              <UsersIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                  View Students
                </h4>
                <p className="text-xs text-gray-500">Manage student progress</p>
              </div>
            </Link>
            
            <Link
              to="/progress"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors group"
            >
              <ChartBarIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                  View Analytics
                </h4>
                <p className="text-xs text-gray-500">Track course performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              My Courses
            </h3>
            <Link
              to="/courses"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all courses
            </Link>
          </div>
          
          {myCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{course.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{course.category}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {course.enrollmentCount || 0} students
                        </span>
                        <span className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isPublished ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Course
                    </Link>
                    <Link
                      to={`/courses/${course.id}/edit`}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first course to start teaching.
              </p>
              <div className="mt-6">
                <Link to="/courses/create" className="btn btn-primary">
                  Create Course
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;