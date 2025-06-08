// frontend/src/components/DomainInfoPanel.jsx
import React from 'react';
import { GlobeAltIcon, UserIcon, CalendarIcon, ClockIcon, ServerIcon } from '@heroicons/react/24/solid';

/**
 * Component to display detailed domain information
 */
const DomainInfoPanel = ({ domainInfo }) => {
  if (!domainInfo) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
      <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
        <GlobeAltIcon className="h-4 w-4 mr-2" />
        Domain Information
      </h4>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainInfo.name && (
            <div className="flex items-start">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Domain Name</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{domainInfo.name}</div>
              </div>
            </div>
          )}
          
          {domainInfo.registrar && (
            <div className="flex items-start">
              <UserIcon className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Registrar</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{domainInfo.registrar}</div>
              </div>
            </div>
          )}
          
          {domainInfo.creationDate && (
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Created On</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date(domainInfo.creationDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          {domainInfo.expiryDate && (
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Expires On</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date(domainInfo.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          {domainInfo.ipAddress && (
            <div className="flex items-start">
              <ServerIcon className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">IP Address</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{domainInfo.ipAddress}</div>
              </div>
            </div>
          )}
          
          {domainInfo.ageInDays !== undefined && (
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Domain Age</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {domainInfo.ageInDays} days
                  {domainInfo.ageInDays < 30 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded">New</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {domainInfo.ageInDays !== undefined && domainInfo.ageInDays < 30 && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start">
              <CalendarIcon className="h-4 w-4 mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                This domain is very new (less than 30 days old). New domains are sometimes used for phishing campaigns.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainInfoPanel;
