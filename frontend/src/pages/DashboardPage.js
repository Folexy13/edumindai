import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, coursesResponse, achievementsResponse] = await Promise.all([
        api.gamification.getProgress(),
        api.learning.getMyCourses(),
        api.gamification.getAchievements()
      ]);

      setStats(statsResponse.data);
      setRecentCourses(coursesResponse.data.courses.slice(0, 3));
      setAchievements(achievementsResponse.data.earned.slice(0, 3));
      
      announce('Dashboard loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      announce('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Current Level',
      value: stats?.level || 1,
      icon: TrophyIcon,
      color: 'bg-yellow-500',
      description: `${stats?.xpToNextLevel || 0} XP to next level`
    },
    {
      title: 'Total XP',
      value: stats?.xp || 0,
      icon: SparklesIcon,
      color: 'bg-purple-500',
      description: 'Experience points earned'
    },
    {
      title: 'Learning Streak',
      value: stats?.learningStreak || 0,
      icon: FireIcon,
      color: 'bg-orange-500',
      description: 'Days in a row'
    },
    {
      title: 'Courses Completed',
      value: stats?.coursesCompleted || 0,
      icon: AcademicCapIcon,
      color: 'bg-green-500',
      description: `${stats?.coursesEnrolled || 0} courses enrolled`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to continue your learning journey? Let's see what you can achieve today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="card hover-lift"
            role="region"
            aria-labelledby={`stat-${index}-title`}
          >
            <div className="card-body">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <h3 id={`stat-${index}-title`} className="text-lg font-medium text-gray-900">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats && (
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Level {stats.level} Progress
              </h3>
              <span className="text-sm text-gray-500">
                {Math.round(stats.progressToNextLevel * 100)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.round(stats.progressToNextLevel * 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(stats.progressToNextLevel * 100)}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`Level progress: ${Math.round(stats.progressToNextLevel * 100)}%`}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.xpToNextLevel} XP needed to reach Level {stats.level + 1}
            </p>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                Continue Learning
              </h2>
            </div>
            <div className="card-body">
              {recentCourses.length > 0 ? (
                <div className="space-y-4">
                  {recentCourses.map((course) => (
                    <div
                      key={course.courseId}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.description}</p>
                        <div className="mt-2">
                          <div className="progress-bar h-2">
                            <div
                              className="progress-fill h-2"
                              style={{ width: `${course.progress}%` }}
                              role="progressbar"
                              aria-valuenow={course.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-label={`Course progress: ${course.progress}%`}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {course.progress}% complete
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/learning/${course.courseId}`}
                        className="btn btn-primary ml-4"
                        aria-label={`Continue learning ${course.title}`}
                      >
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Link to="/courses" className="btn btn-primary">
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                Recent Achievements
              </h2>
            </div>
            <div className="card-body">
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <span className="text-2xl" role="img" aria-label="Achievement">
                          🏆
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/progress"
                    className="block text-center text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all achievements
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <TrophyIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Complete activities to earn achievements
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link
                  to="/ai-tutor"
                  className="block w-full btn btn-outline"
                  aria-label="Start AI tutoring session"
                >
                  <AcademicCapIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Ask AI Tutor
                </Link>
                <Link
                  to="/courses"
                  className="block w-full btn btn-outline"
                  aria-label="Browse available courses"
                >
                  <BookOpenIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Browse Courses
                </Link>
                <Link
                  to="/progress"
                  className="block w-full btn btn-outline"
                  aria-label="View learning progress and analytics"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  View Progress
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;