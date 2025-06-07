// frontend/src/components/ScanResultDisplay.jsx
import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon, // For positive details
  ShieldExclamationIcon, // For negative/warning details
} from '@heroicons/react/24/solid';

const ScanResultDisplay = ({ result }) => {
  if (!result || result.status === 'idle' || result.status === 'loading') {
    // We can add a dedicated loading state here if we want
    // For now, returning null as the form has its own loading indicator
    return null;
  }

  let config = {};

  switch (result.status) {
    case 'benign':
      config = {
        bgColor: 'bg-green-50 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-300',
        borderColor: 'border-green-500/50 dark:border-green-600/70',
        IconComponent: CheckCircleIcon,
        iconColor: 'text-green-500 dark:text-green-400',
        detailIcon: ShieldCheckIcon,
        detailIconColor: 'text-green-500'
      };
      break;
    case 'malicious':
      config = {
        bgColor: 'bg-red-50 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-300',
        borderColor: 'border-red-500/50 dark:border-red-600/70',
        IconComponent: XCircleIcon,
        iconColor: 'text-red-500 dark:text-red-400',
        detailIcon: ShieldExclamationIcon,
        detailIconColor: 'text-red-500'
      };
      break;
    case 'suspicious':
      config = {
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-400',
        borderColor: 'border-yellow-500/50 dark:border-yellow-600/70',
        IconComponent: ExclamationTriangleIcon,
        iconColor: 'text-yellow-500 dark:text-yellow-400',
        detailIcon: ShieldExclamationIcon,
        detailIconColor: 'text-yellow-500'
      };
      break;
    default: // Covers 'error' case
      config = {
        bgColor: 'bg-slate-100 dark:bg-slate-700/30',
        textColor: 'text-slate-800 dark:text-slate-300',
        borderColor: 'border-slate-500/50 dark:border-slate-600/70',
        IconComponent: InformationCircleIcon,
        iconColor: 'text-slate-500 dark:text-slate-400',
      };
      result.message = result.message || 'An error occurred or status is unknown.';
      break;
  }

  const { IconComponent } = config; // Destructure for easier use

  return (
    // Added a simple keyframe animation for the card appearing
    <div 
      style={{ animation: 'fadeInUp 0.5s ease-out forwards' }}
      className={`mt-8 p-6 rounded-xl shadow-lg border ${config.borderColor} ${config.bgColor} transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-start">
        <IconComponent className={`h-8 w-8 mr-4 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-grow">
          <h3 className={`text-xl font-bold ${config.textColor} mb-1 capitalize`}>{result.status}</h3>
          {result.url && (
            <p className="text-sm text-slate-600 dark:text-slate-400 break-all mb-2">
              Scanned URL: <strong className="font-semibold">{result.url}</strong>
            </p>
          )}
          <p className={`text-base font-medium ${config.textColor}`}>{result.message}</p>
          {result.confidence !== undefined && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Confidence: {Math.round(result.confidence * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* Render factors with their specific impact colors */}
      {result.factors && result.factors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Key Factors:</h4>
          <ul className="space-y-2">
            {result.factors.map((factor, index) => {
              // Determine the icon and color based on the factor's impact
              const FactorIcon = factor.impact === "positive" 
                ? ShieldCheckIcon 
                : ShieldExclamationIcon;
              
              const iconColor = factor.impact === "positive" 
                ? "text-green-500 dark:text-green-400" 
                : "text-red-500 dark:text-red-400";
                
              const textColor = factor.impact === "positive" 
                ? "text-green-700 dark:text-green-300" 
                : "text-red-700 dark:text-red-300";
                
              return (
                <li key={index} className="flex items-start p-2 rounded-md bg-slate-50 dark:bg-slate-800/50">
                  <FactorIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${iconColor}`} />
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${textColor}`}>{factor.name}: </span>
                      <span className="text-sm ml-1 text-slate-700 dark:text-slate-300">{factor.value}</span>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">{factor.description}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Keep backward compatibility with old 'details' format if present */}
      {!result.factors && result.details && result.details.length > 0 && config.detailIcon && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Key Factors:</h4>
          <ul className="space-y-2">
            {result.details.map((detail, index) => (
              <li key={index} className="flex items-start">
                <config.detailIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${config.detailIconColor}`} />
                <span className="text-sm text-slate-700 dark:text-slate-300">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScanResultDisplay;