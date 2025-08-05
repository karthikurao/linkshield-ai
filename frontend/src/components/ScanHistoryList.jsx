// frontend/src/components/ScanHistoryList.jsx
import React, { useState, useEffect } from 'react';
import { getHistoryApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ScanHistoryItem from './ScanHistoryItem';
import EmptyState from './EmptyState';

const ScanHistoryList = ({ refreshTrigger }) => {
  // Initialize history to null to represent the "not yet loaded" state
  const [history, setHistory] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only fetch history if user is authenticated
    if (!isAuthenticated || !user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const historyData = await getHistoryApi(15);
        // Ensure that even if the API returns a falsy value, we set state to a safe empty array.
        setHistory(historyData || []); 
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err.message || 'Failed to load scan history.');
        // When an error occurs, we still ensure history is a safe empty array to prevent crashes.
        setHistory([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [refreshTrigger, isAuthenticated, user]); // Added authentication dependencies 

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center py-10 text-slate-500 dark:text-slate-400">Loading history...</p>;
    }

    if (error) {
      return (
        <EmptyState 
          title="Could Not Load History"
          message={error}
        />
      );
    }
    
    // This check is now safe because 'history' will be an array, not undefined.
    if (history && history.length === 0) {
      return (
        <EmptyState 
          title="No Scan History"
          message="Perform your first scan to see the results here."
        />
      );
    }

    if (history && history.length > 0) {
        return (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {history.map((item) => (
              <ScanHistoryItem key={item.scan_id} item={item} />
            ))}
          </ul>
        );
    }

    return null; // Fallback case
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Recent Scans</h2>
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-300/70 dark:border-slate-700/60 p-4 min-h-[150px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default ScanHistoryList;