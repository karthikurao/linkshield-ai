// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for authentication
const AuthContext = createContext(null);

// This provider component will wrap your app and provide authentication state
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  // Check for existing login on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('mockAuthUser');
    if (savedUser) {
      setAuthState({
        isAuthenticated: true,
        user: { username: savedUser },
        loading: false
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  }, []);

  // Login function - in a real app, this would call your backend API
  const signIn = async (username, password) => {
    // Simple mock authentication
    if (username && password) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store in localStorage for persistence
      localStorage.setItem('mockAuthUser', username);
      
      setAuthState({
        isAuthenticated: true,
        user: { username },
        loading: false
      });
      
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  // Logout function
  const signOut = async () => {
    localStorage.removeItem('mockAuthUser');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  // Create a value object with all the data and functions consumers need
  const contextValue = {
    ...authState,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// For compatibility with existing code using AWS Amplify
export const useAuthenticator = () => {
  const { isAuthenticated, user, signIn, signOut } = useAuth();
  
  return {
    authStatus: isAuthenticated ? 'authenticated' : 'unauthenticated',
    user: user,
    signIn,
    signOut
  };
};
