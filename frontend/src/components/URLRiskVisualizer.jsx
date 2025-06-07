// frontend/src/components/URLRiskVisualizer.jsx
import React, { useState, useEffect } from 'react';

const URLRiskVisualizer = ({ url, riskFactors }) => {
  const [parsedUrl, setParsedUrl] = useState(null);
  
  useEffect(() => {
    if (!url) return;
    
    try {
      // Parse the URL into components
      const urlObj = new URL(url);
      
      // Create a structure with each part of the URL
      setParsedUrl({
        protocol: urlObj.protocol,
        subdomain: urlObj.hostname.split('.').length > 2 ? 
          urlObj.hostname.substring(0, urlObj.hostname.indexOf('.')) : null,
        domain: urlObj.hostname.split('.').length > 2 ? 
          urlObj.hostname.substring(urlObj.hostname.indexOf('.')+1) : 
          urlObj.hostname,
        path: urlObj.pathname,
        query: urlObj.search,
        fragment: urlObj.hash
      });
    } catch (error) {
      console.error("Error parsing URL:", error);
      setParsedUrl(null);
    }
  }, [url]);
  
  // Find risk level for a specific part of the URL
  const getRiskLevel = (part) => {
    if (!riskFactors) return 'neutral';
    
    const relevantFactor = riskFactors.find(f => 
      f.name.toLowerCase().includes(part.toLowerCase())
    );
    
    if (!relevantFactor) return 'neutral';
    
    // Map the impact to CSS classes
    const impactMap = {
      high: 'high-risk',
      medium: 'medium-risk',
      low: 'low-risk',
      safe: 'safe'
    };
    
    return impactMap[relevantFactor.impact] || 'neutral';
  };
  
  if (!parsedUrl) return null;
  
  return (
    <div className="url-visualizer p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-3">URL Risk Analysis</h3>
      
      <div className="url-components space-y-2 font-mono text-sm">
        <div className={`protocol flex items-center p-2 rounded ${getRiskLevel('protocol')}`}>
          <span className="font-bold mr-2">Protocol:</span>
          <span>{parsedUrl.protocol}</span>
        </div>
        
        {parsedUrl.subdomain && (
          <div className={`subdomain flex items-center p-2 rounded ${getRiskLevel('subdomain')}`}>
            <span className="font-bold mr-2">Subdomain:</span>
            <span>{parsedUrl.subdomain}</span>
          </div>
        )}
        
        <div className={`domain flex items-center p-2 rounded ${getRiskLevel('domain')}`}>
          <span className="font-bold mr-2">Domain:</span>
          <span>{parsedUrl.domain}</span>
        </div>
        
        {parsedUrl.path !== '/' && (
          <div className={`path flex items-center p-2 rounded ${getRiskLevel('path')}`}>
            <span className="font-bold mr-2">Path:</span>
            <span className="break-all">{parsedUrl.path}</span>
          </div>
        )}
        
        {parsedUrl.query && (
          <div className={`query flex items-center p-2 rounded ${getRiskLevel('query')}`}>
            <span className="font-bold mr-2">Query:</span>
            <span className="break-all">{parsedUrl.query}</span>
          </div>
        )}
        
        {parsedUrl.fragment && (
          <div className={`fragment flex items-center p-2 rounded ${getRiskLevel('fragment')}`}>
            <span className="font-bold mr-2">Fragment:</span>
            <span>{parsedUrl.fragment}</span>
          </div>
        )}
      </div>
      
      <div className="risk-legend flex justify-between mt-4 text-xs">
        <span className="high-risk-dot">High Risk</span>
        <span className="medium-risk-dot">Medium Risk</span>
        <span className="low-risk-dot">Low Risk</span>
        <span className="safe-dot">Safe</span>
      </div>
    </div>
  );
};

export default URLRiskVisualizer;
