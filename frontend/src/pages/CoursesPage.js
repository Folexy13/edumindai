import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';
import {
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const CoursesPage = () => {
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'programming', name: 'Programming' },
    { id: 'language', name: 'Language Arts' },
    { id: 'history', name: 'History' },
    { id: 'arts', name: 'Arts' },
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const loadCourses = async () => {
    try {
      const response = await api.learning.getCourses();
      setCourses(response.data.courses);
      announce('Courses loaded successfully');
    } catch (error) {
      console.error('Failed to load courses:', error);
      announce('Failed to load courses');
      // Show mock courses for demo
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      await api.learning.enrollCourse(courseId);
      announce('Successfully enrolled in course');
      loadCourses(); // Reload to update enrollment status
    } catch (error) {
      console.error('Failed to enroll:', error);
      announce('Failed to enroll in course');
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
        <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
        <p className="mt-2 text-gray-600">
          Discover personalized learning paths tailored to your interests and goals.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <label htmlFor="course-search" className="sr-only">
              Search courses
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="course-search"
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label htmlFor="level-filter" className="sr-only">
              Filter by level
            </label>
            <select
              id="level-filter"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input"
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <FunnelIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => handleEnrollCourse(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search terms or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}
            className="btn btn-outline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course, onEnroll }) => {
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

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="card hover-lift">
      <div className="card-body">
        {/* Course header */}
        <div className="flex items-start justify-between mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(
              course.level
            )}`}
          >
            {course.level}
          </span>
          <span className="text-sm text-gray-500 capitalize">{course.category}</span>
        </div>

        {/* Course title and description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

        {/* Course meta */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <ClockIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          <span className="mr-4">{formatDuration(course.duration)}</span>
          <AcademicCapIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          <span>{course.lessonsCount} lessons</span>
        </div>

        {/* Progress bar (if enrolled) */}
        {course.enrolled && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
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

        {/* Action button */}
        <div className="flex items-center justify-between">
          {course.enrolled ? (
            <Link
              to={`/learning/${course.id}`}
              className="btn btn-primary flex-1"
              aria-label={`Continue learning ${course.title}`}
            >
              Continue Learning
            </Link>
          ) : (
            <button
              onClick={onEnroll}
              className="btn btn-outline flex-1"
              aria-label={`Enroll in ${course.title}`}
            >
              Enroll Now
            </button>
          )}
        </div>

        {/* Course preview link */}
        <Link
          to={`/courses/${course.id}`}
          className="block text-center text-sm text-primary-600 hover:text-primary-500 mt-2"
          aria-label={`View details for ${course.title}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

// Mock courses for demo purposes
const mockCourses = [
  {
    id: 'math-101',
    title: 'Introduction to Algebra',
    description: 'Learn the fundamentals of algebra including variables, equations, and problem-solving techniques.',
    category: 'mathematics',
    level: 'beginner',
    duration: 120,
    lessonsCount: 12,
    enrolled: false,
    progress: 0,
  },
  {
    id: 'sci-201',
    title: 'Physics Fundamentals',
    description: 'Explore the basic principles of physics including motion, forces, and energy.',
    category: 'science',
    level: 'intermediate',
    duration: 180,
    lessonsCount: 15,
    enrolled: true,
    progress: 45,
  },
  {
    id: 'prog-101',
    title: 'JavaScript Basics',
    description: 'Learn programming fundamentals with JavaScript from variables to functions.',
    category: 'programming',
    level: 'beginner',
    duration: 200,
    lessonsCount: 20,
    enrolled: true,
    progress: 75,
  },
  {
    id: 'lang-301',
    title: 'Creative Writing',
    description: 'Develop your creative writing skills with storytelling techniques and exercises.',
    category: 'language',
    level: 'advanced',
    duration: 150,
    lessonsCount: 10,
    enrolled: false,
    progress: 0,
  },
];

export default CoursesPage;