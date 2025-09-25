import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChartBarIcon,
  BookOpenIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const StudentsPage = () => {
  const { user } = useAuth();
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    loadStudentsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudentsData = async () => {
    try {
      // Get courses created by this teacher
      const coursesResponse = await api.learning.getMyCourses();
      const teacherCourses = coursesResponse.data.courses?.filter(course => course.creatorId === user.id) || [];
      setMyCourses(teacherCourses);

      // Mock student data - in real app, you'd fetch enrolled students
      const mockStudents = [
        {
          id: 1,
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          avatar: null,
          enrolledCourses: teacherCourses.slice(0, 2),
          progress: {
            coursesCompleted: 1,
            averageScore: 85,
            totalHours: 24,
            lastActive: '2025-09-24'
          }
        },
        {
          id: 2,
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob.smith@example.com',
          avatar: null,
          enrolledCourses: teacherCourses.slice(1, 3),
          progress: {
            coursesCompleted: 0,
            averageScore: 78,
            totalHours: 12,
            lastActive: '2025-09-23'
          }
        },
        {
          id: 3,
          firstName: 'Charlie',
          lastName: 'Brown',
          email: 'charlie.brown@example.com',
          avatar: null,
          enrolledCourses: [teacherCourses[0]],
          progress: {
            coursesCompleted: 0,
            averageScore: 92,
            totalHours: 8,
            lastActive: '2025-09-25'
          }
        }
      ];

      setStudents(mockStudents);
      announce(`Loaded ${mockStudents.length} students`);
    } catch (error) {
      console.error('Failed to load students data:', error);
      announce('Failed to load some student data');
      setStudents([]);
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || 
      student.enrolledCourses.some(course => course.id === parseInt(filterCourse));
    
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <p className="mt-2 text-gray-600">
          Monitor your students' progress and engagement across your courses.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-64">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="all">All Courses</option>
                {myCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.reduce((total, student) => total + student.enrolledCourses.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length > 0 
                  ? Math.round(students.reduce((sum, student) => sum + student.progress.averageScore, 0) / students.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Completions</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.reduce((total, student) => total + student.progress.coursesCompleted, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Students ({filteredStudents.length})
          </h3>
        </div>
        
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={student.avatar} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserCircleIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.enrolledCourses.length} course{student.enrolledCourses.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.enrolledCourses.slice(0, 2).map(course => course.title).join(', ')}
                        {student.enrolledCourses.length > 2 && ` +${student.enrolledCourses.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {student.progress.averageScore}% avg
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.progress.totalHours} hours • {student.progress.coursesCompleted} completed
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.progress.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        View Details
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Send Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCourse !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Students will appear here once they enroll in your courses.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
