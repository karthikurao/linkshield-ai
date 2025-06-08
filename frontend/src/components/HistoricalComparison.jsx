// frontend/src/components/HistoricalComparison.jsx
import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

/**
 * Component to show historical comparison of URL scan results
 * This would typically fetch previous scan data for the same/similar URLs
 */
const HistoricalComparison = ({ result, previousScans = [] }) => {
  if (!result || !previousScans || previousScans.length === 0) {
    return null;
  }

  // We'd typically get this from an API, but we'll simulate it for now
  const previousScan = previousScans[0];
  const riskTrend = previousScan?.riskScore < result.riskScore ? 'increased' : 'decreased';
  const trendValue = previousScan?.riskScore 
    ? Math.abs(result.riskScore - previousScan.riskScore) 
    : 0;

  return (
    <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
      <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
        <ChartBarIcon className="h-4 w-4 mr-2" />
        Historical Analysis
      </h4>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Previous Scan Comparison
            </div>
            
            {trendValue > 0 ? (
              <div className="flex items-center">
                <span className="text-sm mr-2">Risk has</span>
                <span className={`flex items-center text-sm font-medium ${
                  riskTrend === 'increased' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {riskTrend === 'increased' ? (
                    <>
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      increased by {trendValue.toFixed(0)} points
                    </>
                  ) : (
                    <>
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      decreased by {trendValue.toFixed(0)} points
                    </>
                  )}
                </span>
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                No significant change since last scan
              </div>
            )}
            
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
              {previousScan?.scanTimestamp ? (
                `Last scanned: ${new Date(previousScan.scanTimestamp).toLocaleString()}`
              ) : (
                "First time this URL has been scanned"
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative w-full h-16">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-700"></div>
              </div>
              
              {/* Previous score marker */}
              {previousScan?.riskScore && (
                <div 
                  className="absolute top-0 h-16 flex flex-col items-center justify-between" 
                  style={{ left: `${previousScan.riskScore}%` }}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">Previous</div>
                  <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 z-10"></div>
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {previousScan.riskScore}
                  </div>
                </div>
              )}
              
              {/* Current score marker */}
              <div 
                className="absolute top-0 h-16 flex flex-col items-center justify-between" 
                style={{ left: `${result.riskScore}%` }}
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">Current</div>
                <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 z-10"></div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-300">
                  {result.riskScore}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalComparison;
