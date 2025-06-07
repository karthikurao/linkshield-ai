// frontend/src/components/ScanHistoryItem.jsx
import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

const ScanHistoryItem = ({ item }) => {
  let config = {};

  switch (item.status) {
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

  return (
    <li className="flex items-center justify-between p-3 transition-colors duration-200 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
      <div className="flex items-center truncate">
        <config.Icon className={`h-6 w-6 mr-3 flex-shrink-0 ${config.color}`} />
        <div className="truncate">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={item.url}>
            {item.url}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {item.status}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(item.scan_timestamp).toLocaleString()}
        </p>
      </div>
    </li>
  );
};

export default ScanHistoryItem;