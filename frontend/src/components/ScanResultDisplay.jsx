// frontend/src/components/ScanResultDisplay.jsx
import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon, // For positive details
  ShieldExclamationIcon, // For negative/warning details
  GlobeAltIcon,
  ClockIcon,
  ServerIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ShareIcon,
  ChartBarIcon,
  FingerPrintIcon,
  LinkIcon
} from '@heroicons/react/24/solid';

// Import our new components
import SSLCertificateInfo from './SSLCertificateInfo';
import DomainInfoPanel from './DomainInfoPanel';
import HistoricalComparison from './HistoricalComparison';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleString();
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return new Date().toLocaleString();
  }
};

// Helper function to get domain from URL
const extractDomain = (url) => {
  try {
    if (!url) return "";
    // Remove protocol and get domain
    return url.replace(/(^\w+:|^)\/\//, '').split('/')[0];
  } catch {
    return url;
  }
};

const ScanResultDisplay = ({ result, previousScans = [] }) => {
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
      className={`mt-8 p-6 rounded-xl shadow-lg border-2 ${config.borderColor} ${config.bgColor} transition-all duration-300 ease-in-out ${
        result.status === 'malicious' ? 'ring-4 ring-red-500/30 dark:ring-red-600/40' : ''
      }`}
    >
      {/* Add danger banner for malicious URLs */}
      {result.status === 'malicious' && (
        <div className="mb-4 -mx-6 -mt-6 p-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl border-b-2 border-red-800">
          <div className="flex items-center justify-center">
            <XCircleIcon className="h-6 w-6 mr-2 animate-pulse" />
            <span className="text-lg font-bold uppercase tracking-wide">⚠️ DANGER - MALICIOUS WEBSITE DETECTED ⚠️</span>
            <XCircleIcon className="h-6 w-6 ml-2 animate-pulse" />
          </div>
          <p className="text-center text-sm mt-1 font-medium">DO NOT ENTER ANY PERSONAL INFORMATION</p>
        </div>
      )}
      
      {/* Add warning banner for suspicious URLs */}
      {result.status === 'suspicious' && (
        <div className="mb-4 -mx-6 -mt-6 p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-xl border-b-2 border-yellow-700">
          <div className="flex items-center justify-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <span className="text-lg font-bold uppercase tracking-wide">⚠️ SUSPICIOUS WEBSITE - PROCEED WITH CAUTION</span>
          </div>
        </div>
      )}
      
      <div className="flex items-start">
        <IconComponent className={`h-8 w-8 mr-4 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-grow">          <h3 className={`text-xl font-bold ${config.textColor} mb-1 capitalize`}>{result.status}</h3>
          {result.url && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 break-all mb-2">
              <GlobeAltIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <p>
                URL: <strong className="font-semibold">{result.url}</strong>
              </p>
            </div>
          )}
          <p className={`text-base font-medium ${config.textColor}`}>{result.message}</p>
          
          {/* Enhanced confidence display with visual meter */}
          {result.confidence !== undefined && (
            <div className="mt-3 mb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Detection Confidence</span>
                <span className={`text-sm font-bold ${config.textColor}`}>{Math.round(result.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${config.iconColor}`} 
                  style={{ width: `${Math.round(result.confidence * 100)}%`, transition: 'width 1s ease-in-out' }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Risk level badge */}
          {result.riskLevel && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">Risk Level:</span>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full 
                ${result.riskLevel === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                  result.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Risk Score Gauge */}
      {result.riskScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Risk Assessment</h4>
          <div className="flex justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  className="dark:stroke-slate-700"
                />
                {/* Foreground circle - the actual gauge */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={result.riskScore > 60 ? '#ef4444' : (result.riskScore > 30 ? '#f59e0b' : '#10b981')}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 45 * (result.riskScore / 100)} ${2 * Math.PI * 45 * (1 - result.riskScore / 100)}`}
                  strokeDashoffset={2 * Math.PI * 45 * 0.25}
                  className="transition-all duration-1000 ease-in-out"
                />
                {/* Text in the middle */}
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="24"
                  fontWeight="bold"
                  fill="currentColor"
                  className="text-slate-800 dark:text-slate-200"
                >
                  {result.riskScore}
                </text>
                <text
                  x="50"
                  y="65"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="text-slate-600 dark:text-slate-400"
                >
                  RISK SCORE
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Domain Reputation Visualization */}
      {result.url && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <GlobeAltIcon className="h-4 w-4 mr-2" />
            Domain Information
          </h4>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Domain Details */}
              <div className="flex-1">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Domain: <strong className="font-semibold text-slate-800 dark:text-slate-200">{extractDomain(result.url)}</strong>
                </div>
                
                {/* Protocol Security */}
                <div className="flex items-center mt-2">
                  {result.url?.startsWith('https') ? (
                    <>
                      <LockClosedIcon className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">Secure Connection (HTTPS)</span>
                    </>
                  ) : (
                    <>
                      <LockOpenIcon className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-xs text-red-600 dark:text-red-400">Insecure Connection (HTTP)</span>
                    </>
                  )}
                </div>
                
                {/* Domain Age Indicator - this will be based on risk factors */}
                {result.riskFactors?.some(factor => factor.name === "Domain Age") && (
                  <div className="flex items-center mt-2">
                    <ClockIcon className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {result.riskFactors.find(factor => factor.name === "Domain Age")?.description || "Domain age information not available"}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Reputation Meter */}
              <div className="flex-1">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 text-center">Domain Reputation</div>
                <div className="relative pt-1 mx-auto max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-red-500 dark:text-red-400">Poor</div>
                    <div className="text-xs text-green-500 dark:text-green-400">Excellent</div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 dark:from-red-900 dark:via-yellow-700 dark:to-green-700">
                    <div
                      style={{ 
                        position: 'absolute', 
                        left: `${Math.min(Math.max((100 - result.riskScore), 0), 100)}%`,
                        transform: 'translateX(-50%)'
                      }}
                      className="transition-all duration-1000 ease-in-out"
                    >
                      <div className="w-3 h-3 bg-slate-800 dark:bg-white rounded-full shadow-md"></div>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full
                      ${result.riskScore < 30 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                        result.riskScore < 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                    >
                      {result.riskScore < 30 ? 'Trustworthy' : 
                       result.riskScore < 70 ? 'Uncertain' : 
                       'Untrustworthy'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Threat Type Indicator */}
      {(result.status === 'malicious' || result.status === 'suspicious') && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <FingerPrintIcon className="h-4 w-4 mr-2" />
            Threat Classification
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* We're using the risk factors to determine which threat types to show */}
            {result.riskFactors?.some(f => f.name.toLowerCase().includes('domain') || f.description.toLowerCase().includes('domain')) && (
              <div className={`p-3 rounded-lg flex items-center ${
                result.status === 'malicious' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <GlobeAltIcon className={`h-5 w-5 mr-2 ${
                  result.status === 'malicious' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'
                }`} />
                <span className="text-xs font-medium">Suspicious Domain</span>
              </div>
            )}
            
            {result.riskFactors?.some(f => f.name.toLowerCase().includes('url') || f.description.toLowerCase().includes('special character')) && (
              <div className={`p-3 rounded-lg flex items-center ${
                result.status === 'malicious' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <LinkIcon className={`h-5 w-5 mr-2 ${
                  result.status === 'malicious' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'
                }`} />
                <span className="text-xs font-medium">URL Manipulation</span>
              </div>
            )}
            
            {result.riskFactors?.some(f => f.name.toLowerCase().includes('security') || f.description.toLowerCase().includes('http')) && (
              <div className={`p-3 rounded-lg flex items-center ${
                result.status === 'malicious' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <LockOpenIcon className={`h-5 w-5 mr-2 ${
                  result.status === 'malicious' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'
                }`} />
                <span className="text-xs font-medium">Security Issue</span>
              </div>
            )}
            
            {result.riskFactors?.some(f => f.name.toLowerCase().includes('keyword') || f.description.toLowerCase().includes('keyword')) && (
              <div className={`p-3 rounded-lg flex items-center ${
                result.status === 'malicious' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <DocumentTextIcon className={`h-5 w-5 mr-2 ${
                  result.status === 'malicious' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'
                }`} />
                <span className="text-xs font-medium">Deceptive Content</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Render new domain info panel if available */}
      {result.domainInfo && <DomainInfoPanel domainInfo={result.domainInfo} />}
      
      {/* Render SSL info if available */}
      {result.sslInfo && <SSLCertificateInfo sslInfo={result.sslInfo} />}
      
      {/* Render historical comparison if previous scans are available */}
      {previousScans && previousScans.length > 0 && (
        <HistoricalComparison result={result} previousScans={previousScans} />
      )}

      {/* Render factors with their specific impact colors */}
      {result.riskFactors && result.riskFactors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Risk Assessment:</h4>
          <ul className="space-y-2">
            {result.riskFactors.map((factor, index) => {
              // Determine the icon based on the factor type
              let FactorIcon = ShieldExclamationIcon;
              
              // Choose an appropriate icon based on the factor name
              if (factor.name.toLowerCase().includes('domain')) {
                FactorIcon = GlobeAltIcon;
              } else if (factor.name.toLowerCase().includes('url')) {
                FactorIcon = LinkIcon;
              } else if (factor.name.toLowerCase().includes('connection') || factor.name.toLowerCase().includes('security')) {
                FactorIcon = factor.impact === 'low' ? LockClosedIcon : LockOpenIcon;
              } else if (factor.name.toLowerCase().includes('keyword')) {
                FactorIcon = DocumentTextIcon;
              }
              
              let iconColor = "text-yellow-500 dark:text-yellow-400";
              let textColor = "text-yellow-700 dark:text-yellow-300";
              
              if (factor.impact === "high") {
                iconColor = "text-red-500 dark:text-red-400";
                textColor = "text-red-700 dark:text-red-300";
              } else if (factor.impact === "medium") {
                iconColor = "text-yellow-500 dark:text-yellow-400";
                textColor = "text-yellow-700 dark:text-yellow-300";
              } else if (factor.impact === "low") {
                iconColor = "text-green-500 dark:text-green-400";
                textColor = "text-green-700 dark:text-green-300";
              }
                
              return (
                <li key={index} className="flex items-start p-2 rounded-md bg-slate-50 dark:bg-slate-800/50">
                  <FactorIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${iconColor}`} />
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${textColor}`}>{factor.name}</span>
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full 
                        ${factor.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                          factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                        {factor.impact}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">{factor.description}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>      )}
      
      {/* Display string factors if available */}
      {result.factors && result.factors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Key Indicators:</h4>
          <ul className="space-y-2">
            {result.factors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <ShieldExclamationIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${config.detailIconColor}`} />
                <span className="text-sm text-slate-700 dark:text-slate-300">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
        {/* Keep backward compatibility with old 'details' format if present */}
      {!result.factors && result.details && result.details.length > 0 && config.detailIcon && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">Key Factors:</h4>
          <ul className="space-y-2">
            {result.details.map((detail, index) => {
              // Determine severity based on emoji indicators from backend
              let severityColor = 'text-slate-700 dark:text-slate-300';
              let severityBg = 'bg-slate-50 dark:bg-slate-800/50';
              let severityBorder = 'border-slate-200 dark:border-slate-700';
              let iconColor = config.detailIconColor;
              let IconComponent = config.detailIcon;
              
              if (detail.includes('🚨') || detail.includes('CRITICAL') || detail.toUpperCase().includes('CRITICAL')) {
                severityColor = 'text-red-700 dark:text-red-300 font-semibold';
                severityBg = 'bg-red-50 dark:bg-red-900/30';
                severityBorder = 'border-red-300 dark:border-red-700';
                iconColor = 'text-red-600 dark:text-red-400';
                IconComponent = XCircleIcon;
              } else if (detail.includes('🔴') || detail.includes('OVERRIDE') || detail.toUpperCase().includes('OVERRIDE')) {
                severityColor = 'text-red-600 dark:text-red-400 font-medium';
                severityBg = 'bg-red-50 dark:bg-red-900/20';
                severityBorder = 'border-red-200 dark:border-red-800';
                iconColor = 'text-red-500 dark:text-red-400';
                IconComponent = ExclamationCircleIcon;
              } else if (detail.includes('⚠️') || detail.includes('ALERT') || detail.toUpperCase().includes('ALERT')) {
                severityColor = 'text-orange-600 dark:text-orange-400 font-medium';
                severityBg = 'bg-orange-50 dark:bg-orange-900/20';
                severityBorder = 'border-orange-200 dark:border-orange-800';
                iconColor = 'text-orange-500 dark:text-orange-400';
                IconComponent = ExclamationTriangleIcon;
              } else if (detail.includes('🟡') || detail.includes('WARNING') || detail.toUpperCase().includes('WARNING')) {
                severityColor = 'text-yellow-700 dark:text-yellow-300';
                severityBg = 'bg-yellow-50 dark:bg-yellow-900/20';
                severityBorder = 'border-yellow-200 dark:border-yellow-800';
                iconColor = 'text-yellow-500 dark:text-yellow-400';
                IconComponent = ExclamationTriangleIcon;
              }
              
              return (
                <li key={index} className={`flex items-start p-3 rounded-md border ${severityBg} ${severityBorder} transition-all duration-200`}>
                  <IconComponent className={`h-5 w-5 mr-3 flex-shrink-0 ${iconColor}`} />
                  <span className={`text-sm ${severityColor} break-words`}>{detail}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Security tips section for suspicious/malicious URLs */}
      {(result.status === 'malicious' || result.status === 'suspicious') && (
        <div className="mt-4 pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
          <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-2" />
            Security Recommendations
          </h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Do not enter any personal information on this website</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Do not download files or software from this site</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Check for secure connection (https) and valid certificates before entering credentials</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Consider reporting this URL to your security team or anti-phishing services</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Add scan timestamp with proper formatting */}
      <div className="mt-4 pt-2 text-xs text-slate-500 dark:text-slate-500 text-right">
        <span className="flex items-center justify-end">
          <ClockIcon className="h-3 w-3 mr-1" />
          Scan performed: {formatDate(result.scanTimestamp)}
        </span>
      </div>
      
      {/* Share Result Button */}
      <div className="mt-4 flex justify-end">
        <button 
          onClick={() => {
            // Create a shareable text
            const shareText = `LinkShield-AI Scan Result:\n${result.url}\nStatus: ${result.status}\nRisk Score: ${result.riskScore}\nScanned on: ${formatDate(result.scanTimestamp)}`;
            
            // Try to use the clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(shareText)
                .then(() => alert('Scan result copied to clipboard!'))
                .catch(() => alert('Failed to copy. Please try again.'));
            } else {
              alert('Sharing is not available in this context.');
            }
          }}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
        >
          <ShareIcon className="h-4 w-4 mr-2" />
          Share Result
        </button>
      </div>
    </div>
  );
};

export default ScanResultDisplay;