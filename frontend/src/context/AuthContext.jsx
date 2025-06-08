// frontend/src/context/AuthContext.jsx
// This file has been deprecated in favor of AWS Amplify authentication.
// For compatibility with existing code, we provide a wrapper around the AWS Amplify useAuthenticator hook.

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

// This is a compatibility layer to help with the transition to AWS Amplify auth
export const useAuth = () => {
  const { user, authStatus, signOut } = useAuthenticator(context => [context.user, context.authStatus, context.signOut]);
  
  return {
    isAuthenticated: authStatus === 'authenticated',
    user: user,
    signIn: async () => {
      console.warn('Custom signIn method is deprecated. Use Amplify Authenticator component instead.');
      return { success: false, error: 'Please use the AWS Amplify authentication flow.' };
    },
    signOut
  };
};

// Compatibility layer for the old AuthProvider
export const AuthProvider = ({ children }) => {
  console.warn('AuthProvider is deprecated. Use Authenticator.Provider from AWS Amplify instead.');
  return children;
};

// Export useAuthenticator directly for compatibility
export { useAuthenticator };
