import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';
import {
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      const response = await api.learning.getCourse(courseId);
      setCourse(response.data);
      announce('Course details loaded');
    } catch (error) {
      console.error('Failed to load course details:', error);
      // Use mock data for demo
      setCourse(mockCourseDetails);
      announce('Course details loaded');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.learning.enrollCourse(courseId);
      setCourse(prev => ({ ...prev, enrolled: true, progress: 0 }));
      announce('Successfully enrolled in course');
    } catch (error) {
      console.error('Failed to enroll:', error);
      announce('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600">The requested course could not be found.</p>
          <Link to="/courses" className="btn btn-primary mt-4">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getDifficultyColor(
                    course.level
                  )}`}
                >
                  {course.level}
                </span>
                <span className="text-sm text-gray-500 capitalize">{course.category}</span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                </div>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>{course.enrolledCount || 0} students</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-1 text-yellow-400" aria-hidden="true" />
                  <span>{course.rating || '4.5'} ({course.reviewCount || 12} reviews)</span>
                </div>
              </div>

              {/* Progress bar if enrolled */}
              {course.enrolled && course.progress > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Your Progress</span>
                    <span className="text-gray-600">{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                      role="progressbar"
                      aria-valuenow={course.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`Course progress: ${course.progress}%`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Panel */}
            <div className="lg:w-80 lg:ml-8 mt-6 lg:mt-0">
              <div className="card">
                <div className="card-body">
                  {course.enrolled ? (
                    <div className="space-y-4">
                      <div className="flex items-center text-green-600 mb-4">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Enrolled</span>
                      </div>
                      <Link
                        to={`/learning/${course.id}`}
                        className="btn btn-primary w-full"
                        aria-label={`Continue learning ${course.title}`}
                      >
                        Continue Learning
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="btn btn-primary w-full flex items-center justify-center"
                      aria-label={`Enroll in ${course.title}`}
                    >
                      {enrolling ? (
                        <LoadingSpinner size="small" className="mr-2" />
                      ) : (
                        <BookOpenIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                      )}
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">What You'll Learn</h2>
            </div>
            <div className="card-body">
              <ul className="space-y-3">
                {course.learningOutcomes?.map((outcome, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Course Content */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
            </div>
            <div className="card-body">
              {course.lessons?.length > 0 ? (
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          {lesson.type === 'video' ? (
                            <PlayIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <BookOpenIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {index + 1}. {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-500">{lesson.duration} minutes</p>
                        </div>
                      </div>
                      {course.enrolled && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Course content will be available after enrollment.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prerequisites */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Prerequisites</h2>
            </div>
            <div className="card-body">
              {course.prerequisites?.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-700">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start">
                      <span className="h-2 w-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                      {prerequisite}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No prerequisites required</p>
              )}
            </div>
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Instructor</h2>
              </div>
              <div className="card-body">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">{course.instructor.name}</h3>
                    <p className="text-sm text-gray-500">{course.instructor.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">{course.instructor.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for demo purposes
const mockCourseDetails = {
  id: 'math-101',
  title: 'Introduction to Algebra',
  description: 'Master the fundamentals of algebra with this comprehensive course designed for beginners. Learn to work with variables, solve equations, and apply algebraic concepts to real-world problems.',
  category: 'mathematics',
  level: 'beginner',
  duration: 180,
  rating: 4.8,
  reviewCount: 156,
  enrolledCount: 1247,
  enrolled: false,
  progress: 0,
  learningOutcomes: [
    'Understand the basic concepts of algebra and mathematical notation',
    'Work confidently with variables, constants, and algebraic expressions',
    'Solve linear equations and inequalities step by step',
    'Apply algebraic methods to solve real-world problems',
    'Graph linear equations and understand coordinate systems',
    'Factor polynomials and work with quadratic expressions'
  ],
  prerequisites: [
    'Basic arithmetic skills (addition, subtraction, multiplication, division)',
    'Understanding of fractions and decimals',
    'Familiarity with basic mathematical notation'
  ],
  lessons: [
    {
      id: 'lesson-1',
      title: 'What is Algebra?',
      type: 'text',
      duration: 15
    },
    {
      id: 'lesson-2',
      title: 'Variables and Constants',
      type: 'video',
      duration: 20
    },
    {
      id: 'lesson-3',
      title: 'Basic Operations',
      type: 'text',
      duration: 25
    },
    {
      id: 'lesson-4',
      title: 'Solving Simple Equations',
      type: 'video',
      duration: 30
    },
    {
      id: 'lesson-5',
      title: 'Word Problems',
      type: 'text',
      duration: 35
    }
  ],
  instructor: {
    name: 'Dr. Sarah Johnson',
    title: 'Mathematics Professor',
    bio: 'Dr. Johnson has been teaching mathematics for over 15 years and specializes in making complex concepts accessible to students of all levels.'
  }
};

export default CourseDetailsPage;