import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import api from '../../services/api';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

const StudentDashboard = ({ user }) => {
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [announced, setAnnounced] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsResponse, coursesResponse, achievementsResponse] = await Promise.all([
        api.gamification.getProgress(),
        api.learning.getMyCourses(),
        api.gamification.getAchievements()
      ]);

      setStats(statsResponse.data);
      setRecentCourses(coursesResponse.data.courses?.slice(0, 3) || []);
      setAchievements(achievementsResponse.data.earned?.slice(0, 3) || []);
      
      if (!announced) {
        announce('Student dashboard loaded successfully');
        setAnnounced(true);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (!announced) {
        announce('Dashboard loaded with limited data, but you can still navigate the platform');
        setAnnounced(true);
      }
      
      // Set fallback data so the dashboard still renders
      setStats({
        totalXP: 0,
        currentLevel: 1,
        completedCourses: 0,
        activeCourses: 0,
        streak: 0,
        achievements: 0
      });
      setRecentCourses([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, [announce, announced]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.firstName}! 🎓
        </h1>
        <p className="text-primary-100">
          Ready to continue your learning journey? You're making great progress!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total XP</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalXP || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Level</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.currentLevel || 1}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FireIcon className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Streak</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.streak || 0} days</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrophyIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Achievements</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.achievements || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Continue Learning
            </h3>
            <Link
              to="/courses"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all courses
            </Link>
          </div>
          
          {recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={course.thumbnail || '/api/placeholder/300/200'}
                      alt={course.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{course.title}</h4>
                  <p className="text-xs text-gray-500 mb-3">{course.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">{course.progress || 0}%</span>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="mt-3 w-full btn btn-primary btn-sm flex items-center justify-center"
                  >
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Continue
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by exploring our course catalog.
              </p>
              <div className="mt-6">
                <Link to="/courses" className="btn btn-primary">
                  Browse Courses
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Achievements
            </h3>
            <Link
              to="/progress"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all progress
            </Link>
          </div>
          
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl mr-3">{achievement.title.match(/\p{Emoji}/u)?.[0] || '🏆'}</div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                    <span className="text-xs text-primary-600">+{achievement.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No achievements yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start learning to earn your first achievement!
              </p>
              <div className="mt-6">
                <Link to="/ai-tutor" className="btn btn-primary">
                  Start with AI Tutor
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;