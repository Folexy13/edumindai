import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AcademicCapIcon,
  LightBulbIcon,
  ChartBarIcon,
  UsersIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      name: 'AI-Powered Learning',
      description: 'Get personalized explanations and learning paths adapted to your unique learning style.',
      icon: LightBulbIcon,
    },
    {
      name: 'Gamified Experience',
      description: 'Earn XP, unlock achievements, and compete with friends while learning.',
      icon: SparklesIcon,
    },
    {
      name: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and insights.',
      icon: ChartBarIcon,
    },
    {
      name: 'Accessibility First',
      description: 'Built with full accessibility support including screen readers and keyboard navigation.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Expert Courses',
      description: 'Learn from industry experts with comprehensive, structured course content.',
      icon: AcademicCapIcon,
    },
    {
      name: 'Learning Community',
      description: 'Connect with fellow learners and share your knowledge.',
      icon: UsersIcon,
    },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link to="/" className="text-white text-2xl font-bold">
                🧠 EduMind AI
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-10">
              <a href="#features" className="text-base font-medium text-white hover:text-gray-200">
                Features
              </a>
              <a href="#about" className="text-base font-medium text-white hover:text-gray-200">
                About
              </a>
            </nav>
            
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-600 bg-white hover:bg-gray-50"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="whitespace-nowrap text-base font-medium text-white hover:text-gray-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-600 bg-white hover:bg-gray-50"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main>
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="relativemt-15  sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 mix-blend-multiply" />
              </div>
              
              <div className="relative  px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white ">Learn Smarter with</span>
                  <span className="block text-yellow-300">AI-Powered Education</span>
                </h1>
                
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-gray-200 sm:max-w-3xl">
                  Experience personalized learning that adapts to your style, pace, and goals. 
                  Join thousands of learners who are achieving more with EduMind AI.
                </p>
                
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                    {!isAuthenticated && (
                      <Link
                        to="/register"
                        className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                      >
                        Start Learning Free
                      </Link>
                    )}
                    <Link
                      to={isAuthenticated ? "/dashboard" : "/login"}
                      className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800 md:py-4 md:text-lg md:px-10"
                    >
                      {isAuthenticated ? "Go to Dashboard" : "Sign In"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to succeed
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Discover how AI can transform your learning experience with personalized, accessible, and engaging education.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                        {feature.name}
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* About section */}
        <div id="about" className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                About EduMind AI
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Revolutionizing Education Through Technology
              </p>
              <div className="mt-4 max-w-3xl text-xl text-gray-500 lg:mx-auto space-y-6">
                <p>
                  EduMind AI combines cutting-edge artificial intelligence with proven educational methodologies 
                  to create a truly personalized learning experience. Our platform adapts to your unique learning 
                  style, whether you're a visual, auditory, kinesthetic, or reading/writing learner.
                </p>
                <p>
                  Built with accessibility at its core, EduMind AI ensures that quality education is available 
                  to everyone, regardless of their abilities or learning differences. From screen reader support 
                  to keyboard navigation, we've designed every aspect with inclusivity in mind.
                </p>
                <p>
                  Join our community of learners who are achieving their educational goals through the power 
                  of AI-driven personalization, gamified learning experiences, and comprehensive progress tracking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-primary-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to start learning?</span>
              <span className="block">Join EduMind AI today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-200">
              Experience the future of education with personalized AI tutoring, 
              gamified learning, and comprehensive progress tracking.
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
              >
                Get Started for Free
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link to="/accessibility" className="text-gray-400 hover:text-gray-500">
              Accessibility
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 EduMind AI. Built for VirtuHack - Empowering Education Through Innovation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;