// frontend/src/components/LocalAuth.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LocalAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Handle login
        const result = await signIn(formData.email, formData.password);
        if (!result.success) {
          setError(result.error || 'Login failed');
        }
      } else {
        // Handle registration
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        const result = await signUp(formData.email, formData.password, formData.name);
        if (!result.success) {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-xl rounded-xl p-8 border border-slate-300/70 dark:border-slate-700/60">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <svg 
                className="h-12 w-12 text-brand-accent dark:text-brand-accent-dark" 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9.5 9.5c.9-.9 2.1-.9 3 0s.9 2.1 0 3-.9 2.1 0 3c-.9.9-2.1.9-3 0s-.9-2.1 0-3"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              LinkShield AI
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (only for registration) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                           focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
                           placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
                         placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
                         placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password field (only for registration) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm 
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                           focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
                           placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                       text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-hover 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle between login/register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-brand-accent hover:text-brand-accent-hover dark:text-brand-accent-dark dark:hover:text-brand-accent transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalAuth;
