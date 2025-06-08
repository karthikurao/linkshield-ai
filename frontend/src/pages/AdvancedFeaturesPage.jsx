// frontend/src/pages/AdvancedFeaturesPage.jsx
import React, { useState, useEffect } from 'react';
import URLRiskVisualizer from '../components/URLRiskVisualizer';
import BrowserExtensionPromo from '../components/BrowserExtensionPromo';
import PhishingSimulator from '../components/PhishingSimulator';
import ThreatIntelDashboard from '../components/ThreatIntelDashboard';
import CommunityProtection from '../components/CommunityProtection';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getFactorAnalysisApi } from '../services/api';

const AdvancedFeaturesPage = () => {
  const [activeTab, setActiveTab] = useState('threatIntel');
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const isAuthenticated = authStatus === 'authenticated';
  
  // URL Risk Visualizer configuration
  const [url, setUrl] = useState('');
  const [riskFactors, setRiskFactors] = useState([]);
  
  useEffect(() => {
    const fetchRiskFactors = async () => {
      if (!url) return;
      
      try {
        // Using the API service for consistent authentication handling
        const result = await getFactorAnalysisApi(url);
        if (result.riskFactors) {
          setRiskFactors(result.riskFactors);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (error) {
        console.error('Error analyzing URL:', error);
        // Fallback to sample data if API call fails
        setRiskFactors([
          { name: 'Domain Age', impact: 'medium', description: 'Recently registered domain (less than 1 month old)' },
          { name: 'SSL Certificate', impact: 'low', description: 'Valid certificate but from a less common issuer' },
          { name: 'URL Structure', impact: 'high', description: 'Contains suspicious parameters or encoded characters' }
        ]);
      }
    };
    
    fetchRiskFactors();
  }, [url]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'threatIntel':
        return <ThreatIntelDashboard />;
      case 'community':
        return <CommunityProtection />;
      case 'simulator':
        return <PhishingSimulator />;
      case 'tools':
        return (
          <div className="tools-container space-y-8">
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-md p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                Security Tools
              </h2>
              
              <div className="tool-section mb-8">
                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-4">
                  URL Risk Visualizer
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  This tool breaks down a URL into its component parts and highlights potential risk factors.
                </p>
                <URLRiskVisualizer url={url} riskFactors={riskFactors} />
                <div className="mt-4">
                  <label htmlFor="url-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Enter a URL to analyze:
                  </label>
                  <div className="flex">
                    <input
                      id="url-input"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded-l-md px-3 py-2 
                               text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700"
                    />
                    <button
                      onClick={() => setUrl(url)} // Trigger re-fetch
                      className="bg-brand-accent text-white px-4 py-2 rounded-r-md hover:bg-brand-accent-dark"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="tool-section">
                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Browser Extension
                </h3>
                <BrowserExtensionPromo />
              </div>
            </div>
          </div>
        );
      default:
        return <ThreatIntelDashboard />;
    }
  };

  return (
    <div className="advanced-features-page w-full max-w-7xl mx-auto px-4 py-8">
      <div className="page-header mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
          Advanced Security Features
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Explore cutting-edge tools and features to enhance your protection against phishing threats
        </p>
      </div>
      
      {!isAuthenticated && (
        <div className="auth-banner bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500 mr-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">
              Sign in to access all features
            </h3>
            <p className="text-amber-700 dark:text-amber-400">
              Some advanced features require an account. Sign in to unlock full functionality.
            </p>
          </div>
        </div>
      )}
      
      <div className="feature-tabs mb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex overflow-x-auto">
          <button 
            onClick={() => setActiveTab('threatIntel')}
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'threatIntel' 
                ? 'border-brand-accent text-brand-accent dark:text-brand-accent-light'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Threat Intelligence
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'community' 
                ? 'border-brand-accent text-brand-accent dark:text-brand-accent-light'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Community Protection
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'simulator' 
                ? 'border-brand-accent text-brand-accent dark:text-brand-accent-light'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Phishing Simulator
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'tools' 
                ? 'border-brand-accent text-brand-accent dark:text-brand-accent-light'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Security Tools
          </button>
        </div>
      </div>
      
      <div className="feature-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdvancedFeaturesPage;
