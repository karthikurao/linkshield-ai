// frontend/src/components/BrowserExtensionPromo.jsx
import React, { useState } from 'react';

const BrowserExtensionPromo = () => {
  const [showExtensionInstructions, setShowExtensionInstructions] = useState(false);
  
  return (
    <div className="browser-extension-promo mt-8 bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-lg p-6 shadow-md border border-blue-200 dark:border-blue-800">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">
            LinkShield Browser Extension
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Get real-time protection as you browse with our browser extension. 
            Scan links before you click them and get instant alerts about potential phishing threats.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowExtensionInstructions(!showExtensionInstructions)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                         transition-all duration-200 transform hover:scale-105 shadow-sm"
            >
              {showExtensionInstructions ? 'Hide Details' : 'Learn More'}
            </button>
            <a 
              href="#extension-download" 
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md 
                         transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Now
            </a>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="browser-icon-grid grid grid-cols-3 gap-2">
            <div className="browser-icon p-2 bg-white dark:bg-slate-700 rounded-md shadow-sm">
              <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#4285F4"/><path d="M12 5c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0 3.8c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2 3.2-1.4 3.2-3.2-1.4-3.2-3.2-3.2z" fill="#FFF"/></svg>
            </div>
            <div className="browser-icon p-2 bg-white dark:bg-slate-700 rounded-md shadow-sm">
              <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#FF9800"/><path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm0 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="#FFF"/></svg>
            </div>
            <div className="browser-icon p-2 bg-white dark:bg-slate-700 rounded-md shadow-sm">
              <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#0078D7"/><path d="M12 5c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0 3c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="#FFF"/></svg>
            </div>
          </div>
        </div>
      </div>
      
      {showExtensionInstructions && (
        <div className="extension-instructions mt-6 p-4 bg-white/80 dark:bg-slate-800/80 rounded-md">
          <h4 className="font-bold mb-2">Installation Instructions</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download the extension for your browser</li>
            <li>Open your browser's extension management page</li>
            <li>Drag and drop the downloaded file or locate it using the "Load unpacked" option</li>
            <li>Accept the permissions when prompted</li>
            <li>The LinkShield icon will appear in your toolbar - click it to access settings</li>
          </ol>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            <p>After installation, LinkShield will:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Automatically scan links as you hover over them</li>
              <li>Show a safety rating for each website in your search results</li>
              <li>Alert you before you visit potentially dangerous websites</li>
              <li>Sync with your LinkShield account for custom protection settings</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserExtensionPromo;
