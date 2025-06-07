// frontend/src/pages/MockLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MockLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page they were trying to visit before being redirected to login
  const from = location.state?.from?.pathname || '/';
  
  // If already logged in, redirect to home
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // For a student project, we're using a simple mock authentication
      // In a real app, this would call your backend API
      const result = await signIn(username, password);
      
      if (result.success) {
        // Navigate to the page they were trying to access, or home if none
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">
          Sign In
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="shadow-sm appearance-none border border-slate-300 dark:border-slate-600 rounded w-full py-2 px-3 text-slate-700 dark:text-slate-200 dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-accent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="shadow-sm appearance-none border border-slate-300 dark:border-slate-600 rounded w-full py-2 px-3 text-slate-700 dark:text-slate-200 dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            For this student project demo, use any username and password.
          </p>
        </div>
      </div>
      
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        <p>This is a student project with a mock authentication system.</p>
        <p className="mt-1">No real authentication or paid services are being used.</p>
      </div>
    </div>
  );
};

export default MockLoginPage;
