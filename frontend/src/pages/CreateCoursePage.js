import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: '',
    objectives: [''],
    modules: [{
      title: '',
      description: '',
      duration: '',
      lessons: [{
        title: '',
        type: 'video',
        content: '',
        duration: ''
      }]
    }]
  });

  const categories = [
    'Technology',
    'Science',
    'Mathematics',
    'Language Arts',
    'History',
    'Art & Design',
    'Business',
    'Health & Wellness'
  ];

  const lessonTypes = [
    { value: 'video', label: 'Video Lesson', icon: VideoCameraIcon },
    { value: 'text', label: 'Text Content', icon: DocumentTextIcon },
    { value: 'quiz', label: 'Quiz/Assessment', icon: AcademicCapIcon },
    { value: 'reading', label: 'Reading Material', icon: BookOpenIcon }
  ];

  const handleCourseChange = (field, value) => {
    setCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectiveChange = (index, value) => {
    setCourse(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => 
        i === index ? value : obj
      )
    }));
  };

  const addObjective = () => {
    setCourse(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index) => {
    if (course.objectives.length > 1) {
      setCourse(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }));
    }
  };

  const handleModuleChange = (moduleIndex, field, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex ? { ...module, [field]: value } : module
      )
    }));
  };

  const addModule = () => {
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, {
        title: '',
        description: '',
        duration: '',
        lessons: [{
          title: '',
          type: 'video',
          content: '',
          duration: ''
        }]
      }]
    }));
  };

  const removeModule = (index) => {
    if (course.modules.length > 1) {
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex ? {
          ...module,
          lessons: module.lessons.map((lesson, j) => 
            j === lessonIndex ? { ...lesson, [field]: value } : lesson
          )
        } : module
      )
    }));
  };

  const addLesson = (moduleIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex ? {
          ...module,
          lessons: [...module.lessons, {
            title: '',
            type: 'video',
            content: '',
            duration: ''
          }]
        } : module
      )
    }));
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const module = course.modules[moduleIndex];
    if (module.lessons.length > 1) {
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map((mod, i) => 
          i === moduleIndex ? {
            ...mod,
            lessons: mod.lessons.filter((_, j) => j !== lessonIndex)
          } : mod
        )
      }));
    }
  };

  const validateCourse = () => {
    if (!course.title.trim()) {
      announce('Please enter a course title');
      return false;
    }
    if (!course.description.trim()) {
      announce('Please enter a course description');
      return false;
    }
    if (!course.category) {
      announce('Please select a course category');
      return false;
    }
    if (course.objectives.some(obj => !obj.trim())) {
      announce('Please fill in all learning objectives');
      return false;
    }
    if (course.modules.some(mod => !mod.title.trim() || !mod.description.trim())) {
      announce('Please fill in all module titles and descriptions');
      return false;
    }
    
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
      const module = course.modules[moduleIndex];
      if (module.lessons.some(lesson => !lesson.title.trim())) {
        announce(`Please fill in all lesson titles for Module ${moduleIndex + 1}`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCourse()) {
      return;
    }

    setLoading(true);
    announce('Creating course...');

    try {
      // For now, we'll simulate course creation since the backend endpoint might not exist
      // In a real implementation, you'd call: await api.learning.createCourse(course);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      announce('Course created successfully!');
      navigate('/courses');
    } catch (error) {
      console.error('Failed to create course:', error);
      announce('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    announce('Saving draft...');

    try {
      // Simulate saving draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      announce('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      announce('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <AcademicCapIcon className="h-8 w-8 mr-3 text-primary-600" />
          Create New Course
        </h1>
        <p className="mt-2 text-gray-600">
          Design an engaging learning experience for your students
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Course Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={course.title}
                onChange={(e) => handleCourseChange('title', e.target.value)}
                placeholder="Enter a compelling course title..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={course.description}
                onChange={(e) => handleCourseChange('description', e.target.value)}
                placeholder="Describe what students will learn and why it's valuable..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={course.category}
                onChange={(e) => handleCourseChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={course.level}
                onChange={(e) => handleCourseChange('level', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={course.duration}
                onChange={(e) => handleCourseChange('duration', e.target.value)}
                placeholder="e.g., 6 weeks, 20 hours"
              />
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Learning Objectives</h2>
            <button
              type="button"
              onClick={addObjective}
              className="btn btn-outline btn-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Objective
            </button>
          </div>
          
          <div className="space-y-4">
            {course.objectives.map((objective, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder={`Learning objective ${index + 1}...`}
                />
                {course.objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Course Modules */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Course Modules</h2>
            <button
              type="button"
              onClick={addModule}
              className="btn btn-outline btn-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Module
            </button>
          </div>
          
          <div className="space-y-6">
            {course.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Module {moduleIndex + 1}
                  </h3>
                  {course.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Title *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={module.title}
                      onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                      placeholder={`Module ${moduleIndex + 1} title...`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Description *
                    </label>
                    <textarea
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={module.description}
                      onChange={(e) => handleModuleChange(moduleIndex, 'description', e.target.value)}
                      placeholder={`Describe what Module ${moduleIndex + 1} covers...`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={module.duration}
                      onChange={(e) => handleModuleChange(moduleIndex, 'duration', e.target.value)}
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                </div>

                {/* Module Lessons */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-800">Lessons</h4>
                    <button
                      type="button"
                      onClick={() => addLesson(moduleIndex)}
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Add Lesson
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const LessonIcon = lessonTypes.find(type => type.value === lesson.type)?.icon || DocumentTextIcon;
                      
                      return (
                        <div key={lessonIndex} className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <LessonIcon className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm font-medium text-gray-700">
                                Lesson {lessonIndex + 1}
                              </span>
                            </div>
                            {module.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                              value={lesson.title}
                              onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)}
                              placeholder="Lesson title..."
                            />
                            
                            <select
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                              value={lesson.type}
                              onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'type', e.target.value)}
                            >
                              {lessonTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            
                            <input
                              type="text"
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                              value={lesson.duration}
                              onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'duration', e.target.value)}
                              placeholder="Duration..."
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="space-x-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Creating Course...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;