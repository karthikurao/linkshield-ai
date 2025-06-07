// frontend/src/components/URLInputForm.jsx
import React, { useState } from 'react';

// The component accepts 'onScanSubmit' and an optional 'disabled' prop
const URLInputForm = ({ onScanSubmit, disabled = false }) => { 
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled) { // Prevent submission if explicitly disabled (e.g., guest limit reached)
        alert("You have reached your free scan limit. Please sign in to continue.");
        return;
    }
    
    if (!url.trim()) {
      setError('Please enter a URL to scan.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Call the parent's submit handler
    await onScanSubmit(url);
    
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    if (error) setError('');
    setUrl(e.target.value);
  };

  // Dynamically set class names based on error state
  const inputBorderColor = error 
    ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/50' 
    : 'border-slate-300 dark:border-slate-600 focus:border-brand-accent focus:ring-brand-accent/50';

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label htmlFor="urlInput" className="sr-only">
          Enter URL to scan
        </label>
        <div className="relative">
          <input
            type="url"
            id="urlInput"
            name="urlInput"
            value={url}
            onChange={handleInputChange}
            placeholder="e.g., https://example.com/suspicious-link"
            required
            disabled={isLoading || disabled} 
            className={`block w-full px-5 py-3.5 border rounded-lg shadow-sm 
                       bg-slate-50 dark:bg-slate-700 
                       text-slate-900 dark:text-slate-100 
                       placeholder-slate-400 dark:placeholder-slate-500 
                       focus:outline-none focus:ring-2 
                       transition-colors duration-200 ease-in-out text-base sm:text-sm
                       disabled:opacity-60 disabled:cursor-not-allowed
                       ${inputBorderColor}`}
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
          />
        </div>
        {error && (
          <p id="url-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || disabled}
        className={`w-full flex items-center justify-center px-6 py-3.5 
                   border border-transparent rounded-lg shadow-md 
                   text-base font-medium text-white 
                   bg-brand-accent hover:bg-brand-accent-hover 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent-dark 
                   dark:focus:ring-offset-slate-900
                   transition-all duration-200 ease-in-out transform active:scale-95
                   disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {/* --- THIS IS THE CORRECTED SECTION --- */}
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning...
          </>
        ) : (
          'Scan URL'
        )}
        {/* --- END OF CORRECTION --- */}
      </button>
    </form>
  );
};

export default URLInputForm;