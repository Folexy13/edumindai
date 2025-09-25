import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const { announce } = useAccessibility();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        learningStyle: data.learningStyle,
        grade: data.grade
      });
      
      if (result.success) {
        announce(`Welcome to EduMind AI, ${result.user.name}!`);
        navigate('/dashboard');
      } else {
        setError('root', { message: result.error });
        announce(`Registration failed: ${result.error}`);
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' });
      announce('Registration failed due to an unexpected error');
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name field */}
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="form-error" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email address"
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

            {/* Learning Style field */}
            <div>
              <label htmlFor="learningStyle" className="form-label">
                Preferred Learning Style
              </label>
              <select
                id="learningStyle"
                className={`form-input ${errors.learningStyle ? 'border-red-500' : ''}`}
                {...register('learningStyle', {
                  required: 'Please select your learning style'
                })}
                aria-describedby="learning-style-help"
              >
                <option value="">Select your learning style</option>
                <option value="visual">Visual - Learn through images and diagrams</option>
                <option value="auditory">Auditory - Learn through listening and discussion</option>
                <option value="kinesthetic">Kinesthetic - Learn through hands-on activities</option>
                <option value="reading">Reading/Writing - Learn through text and notes</option>
              </select>
              <p id="learning-style-help" className="form-help">
                This helps us personalize your learning experience
              </p>
              {errors.learningStyle && (
                <p className="form-error" role="alert">
                  {errors.learningStyle.message}
                </p>
              )}
            </div>

            {/* Grade level field */}
            <div>
              <label htmlFor="grade" className="form-label">
                Education Level
              </label>
              <select
                id="grade"
                className={`form-input ${errors.grade ? 'border-red-500' : ''}`}
                {...register('grade')}
              >
                <option value="middle-school">Middle School</option>
                <option value="high-school">High School</option>
                <option value="college">College/University</option>
                <option value="graduate">Graduate School</option>
                <option value="professional">Professional Development</option>
              </select>
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
                  autoComplete="new-password"
                  className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  aria-describedby={errors.password ? "password-error" : "password-help"}
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
              {!errors.password && (
                <p id="password-help" className="form-help">
                  Must be at least 6 characters long
                </p>
              )}
              {errors.password && (
                <p id="password-error" className="form-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === watchPassword || 'Passwords do not match'
                  })}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="form-error" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and conditions */}
            <div>
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  {...register('terms', {
                    required: 'You must accept the terms and conditions'
                  })}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="form-error" role="alert">
                  {errors.terms.message}
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
                aria-describedby="create-account-description"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" color="white" className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
              <p id="create-account-description" className="sr-only">
                Create your EduMind AI account to start your personalized learning journey
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

export default RegisterPage;