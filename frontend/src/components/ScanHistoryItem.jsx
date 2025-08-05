// frontend/src/components/ScanHistoryItem.jsx
import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

const ScanHistoryItem = ({ item }) => {
  let config = {};

  // The API returns 'result' field, but component expects 'status'
  const status = item.status || item.result;

  switch (status) {
    case 'benign':
      config = { Icon: CheckCircleIcon, color: 'text-green-500' };
      break;
    case 'malicious':
      config = { Icon: XCircleIcon, color: 'text-red-500' };
      break;
    case 'suspicious':
    default:
      config = { Icon: ExclamationTriangleIcon, color: 'text-yellow-500' };
      break;
  }

  // Handle the date formatting safely
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'No date';
      
      // Handle different possible date formats
      let date;
      
      // If it's already a valid date string in YYYY-MM-DD HH:MM:SS format
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        // SQLite datetime format - add 'T' to make it ISO format
        date = new Date(dateString.replace(' ', 'T'));
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid date';
      }
      
      // Format as locale string with options for better readability
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Date formatting error:', err, dateString);
      return 'Invalid date';
    }
  };

  return (
    <li className="flex items-center justify-between p-3 transition-colors duration-200 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
      <div className="flex items-center truncate">
        <config.Icon className={`h-6 w-6 mr-3 flex-shrink-0 ${config.color}`} />
        <div className="truncate">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={item.url}>
            {item.url}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {status}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(item.scan_time)}
        </p>
      </div>
    </li>
  );
};

export default ScanHistoryItem;