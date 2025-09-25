import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  CogIcon,
  ServerIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const { announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettingsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettingsData = async () => {
    try {
      // Mock settings data - in real app, you'd fetch from admin API
      const mockSettings = {
        general: {
          platformName: 'EduMind AI',
          supportEmail: 'support@edumind.ai',
          maintenanceMode: false,
          userRegistration: true,
          emailNotifications: true
        },
        security: {
          twoFactorAuth: true,
          passwordPolicy: 'strong',
          sessionTimeout: 30,
          maxLoginAttempts: 5
        },
        ai: {
          azureOpenAIEnabled: true,
          modelVersion: 'gpt-4',
          maxTokens: 4096,
          temperature: 0.7
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushNotifications: true,
          announcements: true
        }
      };

      const mockSystemHealth = {
        database: {
          status: 'healthy',
          lastCheck: '2025-09-25T10:15:00Z',
          responseTime: '12ms'
        },
        api: {
          status: 'healthy',
          lastCheck: '2025-09-25T10:15:00Z',
          responseTime: '45ms'
        },
        redis: {
          status: 'warning',
          lastCheck: '2025-09-25T10:15:00Z',
          responseTime: '120ms'
        },
        storage: {
          status: 'healthy',
          lastCheck: '2025-09-25T10:15:00Z',
          usage: '75%'
        }
      };

      setSettings(mockSettings);
      setSystemHealth(mockSystemHealth);
      announce('System settings loaded successfully');
    } catch (error) {
      console.error('Failed to load settings data:', error);
      announce('Failed to load system settings');
      setSettings({});
      setSystemHealth({});
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthStatusBadge = (status) => {
    const statusStyles = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'ai', name: 'AI Settings', icon: ChartBarIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'system', name: 'System Health', icon: ServerIcon },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform Name
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.general?.platformName || ''}
          onChange={() => {}}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Support Email
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.general?.supportEmail || ''}
          onChange={() => {}}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={settings.general?.maintenanceMode || false}
            onChange={() => {}}
          />
          <label className="ml-2 block text-sm text-gray-900">
            Maintenance Mode
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={settings.general?.userRegistration || false}
            onChange={() => {}}
          />
          <label className="ml-2 block text-sm text-gray-900">
            Allow User Registration
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={settings.general?.emailNotifications || false}
            onChange={() => {}}
          />
          <label className="ml-2 block text-sm text-gray-900">
            Email Notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={settings.security?.twoFactorAuth || false}
          onChange={() => {}}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Require Two-Factor Authentication
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Policy
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.security?.passwordPolicy || 'medium'}
          onChange={() => {}}
        >
          <option value="weak">Weak (8+ characters)</option>
          <option value="medium">Medium (8+ chars, mixed case)</option>
          <option value="strong">Strong (12+ chars, mixed case, numbers, symbols)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.security?.sessionTimeout || 30}
          onChange={() => {}}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Login Attempts
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.security?.maxLoginAttempts || 5}
          onChange={() => {}}
        />
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={settings.ai?.azureOpenAIEnabled || false}
          onChange={() => {}}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Enable Azure OpenAI Integration
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Version
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.ai?.modelVersion || 'gpt-4'}
          onChange={() => {}}
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Tokens
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.ai?.maxTokens || 4096}
          onChange={() => {}}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Temperature (0.0 - 2.0)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={settings.ai?.temperature || 0.7}
          onChange={() => {}}
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={settings.notifications?.emailEnabled || false}
          onChange={() => {}}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Email Notifications
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={settings.notifications?.smsEnabled || false}
          onChange={() => {}}
        />
        <label className="ml-2 block text-sm text-gray-900">
          SMS Notifications
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={settings.notifications?.pushNotifications || false}
          onChange={() => {}}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Push Notifications
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={settings.notifications?.announcements || false}
          onChange={() => {}}
        />
        <label className="ml-2 block text-sm text-gray-900">
          System Announcements
        </label>
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(systemHealth).map(([service, health]) => (
          <div key={service} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium text-gray-900 capitalize">
                {service}
              </h4>
              <div className="flex items-center">
                {getHealthStatusIcon(health.status)}
                <span className="ml-2">
                  {getHealthStatusBadge(health.status)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Response Time: {health.responseTime}</p>
              {health.usage && <p>Usage: {health.usage}</p>}
              <p>Last Check: {new Date(health.lastCheck).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">System Status</h4>
            <p className="text-sm text-blue-700 mt-1">
              All critical systems are operational. Redis cache is experiencing slightly elevated response times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure platform settings, security, and monitor system health.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'ai' && renderAISettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'system' && renderSystemHealth()}
      </div>

      {/* Save Button */}
      {activeTab !== 'system' && (
        <div className="flex justify-end">
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;