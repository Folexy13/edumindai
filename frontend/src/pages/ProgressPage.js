import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  CalendarIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const ProgressPage = () => {
  const { user } = useAuth();
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    loadProgressData();
  }, [selectedTimeframe]);

  const loadProgressData = async () => {
    try {
      const [progressResponse, achievementsResponse, activityResponse] = await Promise.all([
        api.gamification.getProgress(),
        api.gamification.getAchievements(),
        api.user.getActivity({ timeframe: selectedTimeframe })
      ]);

      setProgressData(progressResponse.data);
      setAchievements(achievementsResponse.data);
      setActivityData(activityResponse.data.activities || mockActivityData);
      
      announce('Progress data loaded successfully');
    } catch (error) {
      console.error('Failed to load progress data:', error);
      // Use mock data for demo
      setProgressData(mockProgressData);
      setAchievements(mockAchievements);
      setActivityData(mockActivityData);
      announce('Progress data loaded');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-3 text-primary-600" aria-hidden="true" />
          Learning Progress
        </h1>
        <p className="mt-2 text-gray-600">
          Track your achievements, streaks, and learning analytics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Current Level"
          value={progressData?.level || 1}
          subtitle={`${progressData?.xpToNextLevel || 0} XP to next level`}
          icon={TrophyIcon}
          color="yellow"
          progress={progressData?.progressToNextLevel}
        />
        <StatCard
          title="Total XP"
          value={progressData?.xp || 0}
          subtitle="Experience points earned"
          icon={SparklesIcon}
          color="purple"
        />
        <StatCard
          title="Learning Streak"
          value={progressData?.learningStreak || 0}
          subtitle="Days in a row"
          icon={FireIcon}
          color="orange"
        />
        <StatCard
          title="Time Spent"
          value={`${Math.floor((progressData?.totalTimeSpent || 0) / 60)}h`}
          subtitle="Total learning time"
          icon={ClockIcon}
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Learning Activity
                </h2>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="input text-sm"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              <ActivityChart data={activityData} timeframe={selectedTimeframe} />
            </div>
          </div>

          {/* Course Progress */}
          <div className="card mt-6">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <AcademicCapIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                Course Progress
              </h2>
            </div>
            <div className="card-body">
              <CourseProgressList courses={progressData?.courses || mockCourses} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                Achievements
              </h2>
            </div>
            <div className="card-body">
              <AchievementsList achievements={achievements} />
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                Weekly Goals
              </h2>
            </div>
            <div className="card-body">
              <WeeklyGoals goals={progressData?.weeklyGoals || mockGoals} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, progress }) => {
  const colorClasses = {
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        {progress && (
          <div className="mt-4">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.round(progress * 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`${title} progress: ${Math.round(progress * 100)}%`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityChart = ({ data, timeframe }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.map((item, index) => (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-primary-600 rounded-t"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: item.value > 0 ? '4px' : '0px'
              }}
              role="img"
              aria-label={`${item.label}: ${item.value} ${timeframe === 'week' ? 'hours' : 'sessions'}`}
            />
            <span className="text-xs text-gray-600 mt-2 text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-500">
        {timeframe === 'week' ? 'Hours per day' : 'Learning sessions'}
      </div>
    </div>
  );
};

const CourseProgressList = ({ courses }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-6">
        <AcademicCapIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No enrolled courses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{course.title}</h3>
            <span className="text-sm text-gray-500">{course.progress}%</span>
          </div>
          <div className="progress-bar mb-2">
            <div
              className="progress-fill"
              style={{ width: `${course.progress}%` }}
              role="progressbar"
              aria-valuenow={course.progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${course.title} progress: ${course.progress}%`}
            />
          </div>
          <p className="text-xs text-gray-500">
            {course.completedLessons} of {course.totalLessons} lessons completed
          </p>
        </div>
      ))}
    </div>
  );
};

const AchievementsList = ({ achievements }) => {
  const earnedAchievements = achievements.earned || [];
  const availableAchievements = achievements.available || [];

  return (
    <div className="space-y-4">
      {earnedAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Earned</h4>
          <div className="space-y-3">
            {earnedAchievements.slice(0, 5).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <span className="text-2xl mr-3" role="img" aria-label="Achievement">
                  🏆
                </span>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    {achievement.title}
                  </h5>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available</h4>
          <div className="space-y-3">
            {availableAchievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60"
              >
                <span className="text-2xl mr-3" role="img" aria-label="Locked achievement">
                  🔒
                </span>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    {achievement.title}
                  </h5>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WeeklyGoals = ({ goals }) => {
  return (
    <div className="space-y-4">
      {goals.map((goal, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{goal.title}</span>
            <span className="text-sm text-gray-500">
              {goal.current}/{goal.target}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.min((goal.current / goal.target) * 100, 100)}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${goal.title}: ${goal.current} of ${goal.target}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Mock data for demo purposes
const mockProgressData = {
  level: 5,
  xp: 2450,
  xpToNextLevel: 550,
  progressToNextLevel: 0.65,
  learningStreak: 12,
  totalTimeSpent: 3600, // minutes
  coursesCompleted: 3,
  coursesEnrolled: 5,
  courses: [
    {
      id: 'math-101',
      title: 'Introduction to Algebra',
      progress: 85,
      completedLessons: 10,
      totalLessons: 12,
    },
    {
      id: 'sci-201',
      title: 'Physics Fundamentals',
      progress: 60,
      completedLessons: 9,
      totalLessons: 15,
    },
    {
      id: 'prog-101',
      title: 'JavaScript Basics',
      progress: 75,
      completedLessons: 15,
      totalLessons: 20,
    },
  ],
  weeklyGoals: [
    { title: 'Study Sessions', current: 4, target: 7 },
    { title: 'Lessons Completed', current: 8, target: 10 },
    { title: 'Practice Questions', current: 25, target: 30 },
  ],
};

const mockAchievements = {
  earned: [
    {
      id: 'first-lesson',
      title: 'First Steps',
      description: 'Completed your first lesson',
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: '7-day learning streak',
    },
    {
      id: 'level-5',
      title: 'Rising Star',
      description: 'Reached level 5',
    },
  ],
  available: [
    {
      id: 'streak-30',
      title: 'Month Master',
      description: '30-day learning streak',
    },
    {
      id: 'level-10',
      title: 'Knowledge Seeker',
      description: 'Reach level 10',
    },
  ],
};

const mockActivityData = [
  { label: 'Mon', value: 2 },
  { label: 'Tue', value: 1.5 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 1 },
  { label: 'Fri', value: 2.5 },
  { label: 'Sat', value: 0.5 },
  { label: 'Sun', value: 1.5 },
];

const mockCourses = mockProgressData.courses;
const mockGoals = mockProgressData.weeklyGoals;

export default ProgressPage;