// frontend/src/components/SSLCertificateInfo.jsx
import React from 'react';
import { LockClosedIcon, ShieldExclamationIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

/**
 * Component to display SSL certificate information when available
 */
const SSLCertificateInfo = ({ sslInfo }) => {
  if (!sslInfo) {
    return null;
  }

  const isValid = sslInfo.isValid !== undefined ? sslInfo.isValid : true;

  return (
    <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
      <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
        <LockClosedIcon className="h-4 w-4 mr-2" />
        SSL Certificate Information
      </h4>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center mb-3">
          {isValid ? (
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" />
          ) : (
            <XCircleIcon className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
          )}
          <span className={`text-sm font-medium ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            Certificate is {isValid ? 'valid' : 'invalid'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sslInfo.subject && (
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Issued to</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{sslInfo.subject}</span>
            </div>
          )}
          
          {sslInfo.issuer && (
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Issued by</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{sslInfo.issuer}</span>
            </div>
          )}
          
          {sslInfo.validFrom && (
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Valid from</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {new Date(sslInfo.validFrom).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {sslInfo.validTo && (
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Valid until</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {new Date(sslInfo.validTo).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        {!isValid && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <ShieldExclamationIcon className="h-4 w-4 mr-2 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700 dark:text-red-300">
                Invalid SSL certificates can indicate a security risk. The connection may not be secure.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSLCertificateInfo;
