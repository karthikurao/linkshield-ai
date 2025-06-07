// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Amplify } from 'aws-amplify';

// Default Amplify styles
import '@aws-amplify/ui-react/styles.css';
// Your custom theme overrides - import it AFTER the default styles
import './amplify-theme.css'; 

// ... (your Amplify.configure block remains the same)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_COGNITO_APP_CLIENT_ID,
    }
  }
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);