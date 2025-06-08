// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import URLInputForm from './components/URLInputForm';
import ScanResultDisplay from './components/ScanResultDisplay';
import ScanHistoryList from './components/ScanHistoryList';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AdvancedFeaturesPage from './pages/AdvancedFeaturesPage';
import { scanUrlApi, getFactorAnalysisApi } from './services/api';

// CSS imports
import './components/AdvancedFeatures.css';

// AWS Amplify Authentication
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

// A special component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    
    if (authStatus !== 'authenticated') {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // If authenticated, render the children components
    return children;
};


// MainApp now only contains the page content, without auth logic
const AppContent = () => {
  const { overlayStyle } = useTheme();
  const { user, authStatus } = useAuthenticator(context => [context.user, context.authStatus]);
  const isAuthenticated = authStatus === 'authenticated';

  const [scanResult, setScanResult] = useState({ status: 'idle' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Logic for 3 free scans for guests
  const [guestScanCount, setGuestScanCount] = useState(() => {
    return parseInt(localStorage.getItem('guestScanCount') || '0');
  });

        const isScanDisabled = !isAuthenticated && guestScanCount >= 3;

  const handleScanSubmit = async (urlToScan) => {
    if (isScanDisabled) {
        alert("You have reached your free scan limit. Please sign in to continue.");
        return;
    }

    setScanResult({ status: 'loading', url: urlToScan, message: 'Analyzing URL...' });
    
    try {
      // Try to get detailed analysis
      const resultFromApi = await getFactorAnalysisApi(urlToScan);
      setScanResult(resultFromApi);
    } catch {
      // Fall back to the standard scan API if the factor analysis fails
      try {
        const resultFromApi = await scanUrlApi(urlToScan);
        setScanResult(resultFromApi);
      } catch (error) {
        setScanResult({ 
          status: 'error', 
          url: urlToScan, 
          message: error.message || 'Failed to scan URL.' 
        });
      }
    } finally {
      if (!isAuthenticated) {
        const newCount = guestScanCount + 1;
        localStorage.setItem('guestScanCount', newCount);
        setGuestScanCount(newCount);
      }
      setRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen 
                    bg-gradient-to-br from-slate-50 to-slate-200 
                    dark:from-slate-900 dark:to-slate-800 
                    text-slate-900 dark:text-slate-200 
                    transition-colors duration-300 ease-in-out font-sans`}>
      <Header />
      <main className="flex-grow flex flex-col items-center w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/advanced" element={
            <div className="w-full">
              <AdvancedFeaturesPage />
            </div>
          } />
          <Route path="/" element={
            <div className="w-full max-w-2xl">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-xl rounded-xl p-8 md:p-10 
                              border border-slate-300/70 dark:border-slate-700/60">
                <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 
                               bg-gradient-to-r from-brand-accent to-teal-400 dark:from-brand-accent-dark dark:to-teal-300 
                               bg-clip-text text-transparent">
                  LinkShield AI
                </h1>
                <URLInputForm onScanSubmit={handleScanSubmit} disabled={isScanDisabled} />
                {!isAuthenticated && (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                        Scans remaining for guest: <strong>{Math.max(0, 3 - guestScanCount)}</strong>
                    </p>
                )}
                {isScanDisabled && (
                     <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-4">
                        You have reached your free scan limit. Please sign in for unlimited scans.
                    </p>
                )}
              </div>
              <div className="w-full space-y-8 mt-8">
                <ScanResultDisplay result={scanResult} />
                {isAuthenticated && <ScanHistoryList refreshTrigger={refreshTrigger} />}
              </div>
            </div>
          } />
        </Routes>
      </main>
      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-700/50">
        &copy; {new Date().getFullYear()} LinkShield AI. Stay Safe.
      </footer>
      <div className="theme-transition-overlay" style={overlayStyle} />
    </div>
  );
};

// Main App component now just provides context and routing
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Authenticator.Provider>
          <AppContent />
        </Authenticator.Provider>
      </Router>
    </ThemeProvider>
  );
}

export default App;