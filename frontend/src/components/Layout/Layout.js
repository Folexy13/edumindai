import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon as LogoutIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { announce, screenReaderEnabled, enableScreenReader, disableScreenReader } = useAccessibility();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Role-based navigation
  const getNavigationForRole = (userRole) => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    ];

    switch (userRole) {
      case 'STUDENT':
        return [
          ...baseNavigation.slice(0, 1), // Dashboard
          { name: 'My Courses', href: '/courses', icon: BookOpenIcon },
          { name: 'AI Tutor', href: '/ai-tutor', icon: AcademicCapIcon },
          { name: 'Progress', href: '/progress', icon: ChartBarIcon },
          ...baseNavigation.slice(1), // Profile
        ];
      case 'TEACHER':
        return [
          ...baseNavigation.slice(0, 1), // Dashboard
          { name: 'My Courses', href: '/courses', icon: BookOpenIcon },
          { name: 'Create Course', href: '/create-course', icon: DocumentTextIcon },
          { name: 'Students', href: '/students', icon: UsersIcon },
          { name: 'Analytics', href: '/progress', icon: ChartBarIcon },
          ...baseNavigation.slice(1), // Profile
        ];
      case 'ADMIN':
        return [
          ...baseNavigation.slice(0, 1), // Dashboard
          { name: 'All Courses', href: '/courses', icon: BookOpenIcon },
          { name: 'Users Management', href: '/users', icon: UsersIcon },
          { name: 'Analytics', href: '/progress', icon: ChartBarIcon },
          { name: 'System Settings', href: '/settings', icon: CogIcon },
          ...baseNavigation.slice(1), // Profile
        ];
      default:
        return baseNavigation;
    }
  };

  const navigation = getNavigationForRole(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    announce('You have been logged out successfully');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    announce(sidebarOpen ? 'Sidebar closed' : 'Sidebar opened');
  };

  const toggleScreenReader = () => {
    if (screenReaderEnabled) {
      disableScreenReader();
    } else {
      enableScreenReader();
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile menu */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
        
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-gradient">🧠 EduMind AI</span>
            </Link>
          </div>
          
          <nav className="mt-5 flex-shrink-0 h-full divide-y divide-gray-200 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link group flex items-center px-2 py-2 text-sm font-medium ${
                      isActive ? 'active' : ''
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-gradient">🧠 EduMind AI</span>
              </Link>
            </div>
            
            <nav className="mt-5 flex-grow flex flex-col divide-y divide-gray-200 overflow-y-auto">
              <div className="px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`nav-link group flex items-center px-2 py-2 text-sm font-medium ${
                        isActive ? 'active' : ''
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="w-full">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <div className="flex-1 px-4 flex justify-between items-center">
              <div className="flex-1 flex">
                <h1 className="text-2xl font-semibold text-gray-900 sr-only">
                  {navigation.find(nav => nav.href === location.pathname)?.name || 'EduMind AI'}
                </h1>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6 space-x-2">
                {/* Accessibility controls */}
                <button
                  onClick={toggleScreenReader}
                  className="btn btn-ghost p-2"
                  aria-label={screenReaderEnabled ? 'Disable screen reader' : 'Enable screen reader'}
                  title={screenReaderEnabled ? 'Disable screen reader' : 'Enable screen reader'}
                >
                  {screenReaderEnabled ? (
                    <SpeakerXMarkIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <SpeakerWaveIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
                
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="btn btn-ghost p-2"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <SunIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
                
                {/* User menu */}
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-2">
                    Hello, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost p-2"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogoutIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main 
          id="main-content"
          className="flex-1 relative overflow-y-auto focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;