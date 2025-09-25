import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { announce } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        announce(`Welcome back, ${result.user.name}!`);
        navigate(from, { replace: true });
      } else {
        setError('root', { message: result.error });
        announce(`Login failed: ${result.error}`);
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' });
      announce('Login failed due to an unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold text-gradient">🧠 EduMind AI</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Create one now
            </Link>
          </p>
          
          {/* Demo Credentials */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              🎯 Demo Credentials (Use these to test the application)
            </h3>
            <div className="space-y-2 text-xs text-blue-700">
              <div className="flex justify-between">
                <span className="font-medium">Student:</span>
                <span>student@edumind.ai / password123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Teacher:</span>
                <span>teacher@edumind.ai / password123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span>admin@edumind.ai / password123</span>
              </div>
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'student@edumind.ai');
                  setValue('password', 'password123');
                }}
                className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
              >
                Use Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'teacher@edumind.ai');
                  setValue('password', 'password123');
                }}
                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded"
              >
                Use Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'admin@edumind.ai');
                  setValue('password', 'password123');
                }}
                className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded"
              >
                Use Admin
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="form-error" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="form-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Global error */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
                <p className="text-red-700 text-sm">{errors.root.message}</p>
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary flex justify-center py-3"
                aria-describedby="sign-in-description"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" color="white" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
              <p id="sign-in-description" className="sr-only">
                Sign in to access your EduMind AI dashboard and learning materials
              </p>
            </div>

          </form>
        </div>

        {/* Accessibility notice */}
        <div className="text-center">
          <Link
            to="/accessibility"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Accessibility features and support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;