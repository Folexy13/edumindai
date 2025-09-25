import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';
import {
  UserIcon,
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    learningStyle: user?.learningStyle || 'visual',
    studyReminders: user?.preferences?.studyReminders || true,
    emailNotifications: user?.preferences?.emailNotifications || true,
    difficultyLevel: user?.preferences?.difficultyLevel || 'intermediate',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'preferences', name: 'Learning Preferences', icon: AcademicCapIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'accessibility', name: 'Accessibility', icon: EyeIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.user.updateProfile(formData);
      updateUser(response.data.user);
      announce('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      announce('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      announce('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      announce('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      announce('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab formData={formData} onChange={handleInputChange} onSave={handleSaveProfile} loading={loading} />;
      case 'preferences':
        return <PreferencesTab formData={formData} onChange={handleInputChange} onSave={handleSaveProfile} loading={loading} />;
      case 'notifications':
        return <NotificationsTab formData={formData} onChange={handleInputChange} onSave={handleSaveProfile} loading={loading} />;
      case 'accessibility':
        return <AccessibilityTab />;
      case 'security':
        return <SecurityTab passwordForm={passwordForm} onChange={handlePasswordChange} onSave={handleChangePassword} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <UserIcon className="h-8 w-8 mr-3 text-primary-600" aria-hidden="true" />
          Profile Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Profile settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <tab.icon className="h-5 w-5 mr-2" aria-hidden="true" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ formData, onChange, onSave, loading }) => (
  <form onSubmit={onSave} className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="input mt-1"
            required
          />
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary flex items-center"
      >
        {loading && <LoadingSpinner size="small" className="mr-2" />}
        Save Changes
      </button>
    </div>
  </form>
);

const PreferencesTab = ({ formData, onChange, onSave, loading }) => (
  <form onSubmit={onSave} className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Preferences</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700">
            Preferred Learning Style
          </label>
          <select
            id="learningStyle"
            value={formData.learningStyle}
            onChange={(e) => onChange('learningStyle', e.target.value)}
            className="input mt-1"
          >
            <option value="visual">Visual</option>
            <option value="auditory">Auditory</option>
            <option value="kinesthetic">Kinesthetic</option>
            <option value="reading">Reading/Writing</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            This helps us personalize your learning experience
          </p>
        </div>

        <div>
          <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700">
            Default Difficulty Level
          </label>
          <select
            id="difficultyLevel"
            value={formData.difficultyLevel}
            onChange={(e) => onChange('difficultyLevel', e.target.value)}
            className="input mt-1"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary flex items-center"
      >
        {loading && <LoadingSpinner size="small" className="mr-2" />}
        Save Preferences
      </button>
    </div>
  </form>
);

const NotificationsTab = ({ formData, onChange, onSave, loading }) => (
  <form onSubmit={onSave} className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="studyReminders"
              type="checkbox"
              checked={formData.studyReminders}
              onChange={(e) => onChange('studyReminders', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="studyReminders" className="font-medium text-gray-700">
              Study Reminders
            </label>
            <p className="text-gray-500">Get reminded to maintain your learning streak</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="emailNotifications"
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => onChange('emailNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="emailNotifications" className="font-medium text-gray-700">
              Email Notifications
            </label>
            <p className="text-gray-500">Receive course updates and achievements via email</p>
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary flex items-center"
      >
        {loading && <LoadingSpinner size="small" className="mr-2" />}
        Save Settings
      </button>
    </div>
  </form>
);

const AccessibilityTab = () => {
  const { 
    highContrast, 
    toggleHighContrast, 
    fontSize, 
    setFontSize, 
    reducedMotion, 
    toggleReducedMotion 
  } = useAccessibility();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="highContrast"
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="highContrast" className="font-medium text-gray-700">
                High Contrast Mode
              </label>
              <p className="text-gray-500">Increases contrast for better readability</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="reducedMotion"
                type="checkbox"
                checked={reducedMotion}
                onChange={toggleReducedMotion}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="reducedMotion" className="font-medium text-gray-700">
                Reduce Motion
              </label>
              <p className="text-gray-500">Minimizes animations and transitions</p>
            </div>
          </div>

          <div>
            <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
              Font Size
            </label>
            <select
              id="fontSize"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="input mt-1 w-48"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Keyboard Navigation
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use Tab to navigate between elements</li>
          <li>• Use Enter or Space to activate buttons</li>
          <li>• Use arrow keys in menus and lists</li>
          <li>• Use Escape to close dialogs and menus</li>
        </ul>
      </div>
    </div>
  );
};

const SecurityTab = ({ passwordForm, onChange, onSave, loading }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
      
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => onChange('currentPassword', e.target.value)}
            className="input mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => onChange('newPassword', e.target.value)}
            className="input mt-1"
            minLength={6}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            className="input mt-1"
            minLength={6}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading && <LoadingSpinner size="small" className="mr-2" />}
            Change Password
          </button>
        </div>
      </form>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-yellow-900 mb-2">
        Password Requirements
      </h4>
      <ul className="text-sm text-yellow-700 space-y-1">
        <li>• At least 6 characters long</li>
        <li>• Include both letters and numbers</li>
        <li>• Use a unique password not used elsewhere</li>
      </ul>
    </div>
  </div>
);

export default ProfilePage;