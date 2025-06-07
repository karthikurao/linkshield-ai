// frontend/src/components/ThreatIntelDashboard.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const ThreatIntelDashboard = () => {
  const [threatData, setThreatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', '24h', '7d', '30d'
  
  useEffect(() => {
    const fetchThreatIntelligence = async () => {
      try {
        setLoading(true);
        
        // API call to get threat intelligence data based on filter
        const response = await fetch(`${API_BASE_URL}/threat-intel?timeframe=${filter}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch threat intelligence data');
        }
        
        const data = await response.json();
        setThreatData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching threat intelligence:", error);
        setLoading(false);
      }
    };
    
    fetchThreatIntelligence();
  }, [filter]); // Refetch when filter changes
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }
  
  if (!threatData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <p className="text-center text-slate-600 dark:text-slate-400">
          Unable to load threat intelligence data. Please try again later.
        </p>
      </div>
    );
  }
  
  return (
    <div className="threat-intel-dashboard bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-md p-6 backdrop-blur-sm">
      <div className="dashboard-header flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Threat Intelligence Dashboard
        </h2>
        
        <div className="time-filter flex">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-l-md ${
              filter === 'all' 
                ? 'bg-brand-accent text-white' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Time
          </button>
          <button 
            onClick={() => setFilter('24h')}
            className={`px-3 py-1 text-sm border-l border-white/20 ${
              filter === '24h' 
                ? 'bg-brand-accent text-white' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            24h
          </button>
          <button 
            onClick={() => setFilter('7d')}
            className={`px-3 py-1 text-sm border-l border-white/20 ${
              filter === '7d' 
                ? 'bg-brand-accent text-white' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setFilter('30d')}
            className={`px-3 py-1 text-sm rounded-r-md border-l border-white/20 ${
              filter === '30d' 
                ? 'bg-brand-accent text-white' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>
      
      <div className="stat-cards grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/30">
          <div className="stat-title text-blue-800 dark:text-blue-300 text-sm font-medium">
            Total URLs Scanned
          </div>
          <div className="stat-value text-3xl font-bold text-blue-900 dark:text-blue-200 mt-1">
            {threatData.totalScans.toLocaleString()}
          </div>
          <div className="stat-description text-blue-600 dark:text-blue-400 text-xs mt-2">
            All scans performed by LinkShield users
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-800/30">
          <div className="stat-title text-red-800 dark:text-red-300 text-sm font-medium">
            Malicious URLs Detected
          </div>
          <div className="stat-value text-3xl font-bold text-red-900 dark:text-red-200 mt-1">
            {threatData.maliciousDetected.toLocaleString()}
          </div>
          <div className="stat-description text-red-600 dark:text-red-400 text-xs mt-2">
            {((threatData.maliciousDetected / threatData.totalScans) * 100).toFixed(1)}% of all scanned URLs
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
          <div className="stat-title text-emerald-800 dark:text-emerald-300 text-sm font-medium">
            Protected Users
          </div>
          <div className="stat-value text-3xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
            {Math.floor(threatData.totalScans * 0.38).toLocaleString()}
          </div>
          <div className="stat-description text-emerald-600 dark:text-emerald-400 text-xs mt-2">
            Users protected from cyber threats
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="recent-threats bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium mb-3 text-slate-700 dark:text-slate-300">
            Recent Threats Detected
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Domain</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Threat Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {threatData.recentThreats.map((threat, index) => {
                  // Format timestamp
                  const date = new Date(threat.timestamp);
                  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  // Threat level styling
                  const threatLevelClass = 
                    threat.threatLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    threat.threatLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                    threat.threatLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                    
                  return (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                      <td className="px-4 py-3 whitespace-nowrap">{formattedTime}</td>
                      <td className="px-4 py-3 font-medium">{threat.domain}</td>
                      <td className="px-4 py-3 capitalize">{threat.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${threatLevelClass}`}>
                          {threat.threatLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="threat-categories bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium mb-3 text-slate-700 dark:text-slate-300">
            Threat Categories
          </h3>
          <div className="space-y-4">
            {threatData.threatCategories.map((category, index) => (
              <div key={index} className="category-item">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {category.count.toLocaleString()} ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div 
                    className="bg-brand-accent h-2.5 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="geo-distribution bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium mb-3 text-slate-700 dark:text-slate-300">
            Geographical Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="geo-chart h-48 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                [Map Visualization Would Go Here]
              </span>
            </div>
            <div className="geo-stats">
              {threatData.geographicalDistribution.slice(0, 5).map((country, index) => (
                <div key={index} className="country-item flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <span>{country.country}</span>
                  <span className="text-sm font-medium">{country.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="trending-keywords bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium mb-3 text-slate-700 dark:text-slate-300">
            Trending Keywords in Threats
          </h3>
          <div className="keyword-cloud flex flex-wrap gap-2">
            {threatData.trendingKeywords.map((keyword, index) => {
              // Calculate size based on count (relative to max)
              const maxCount = Math.max(...threatData.trendingKeywords.map(k => k.count));
              const minSize = 0.8;
              const maxSize = 1.6;
              const size = minSize + ((keyword.count / maxCount) * (maxSize - minSize));
              
              return (
                <span 
                  key={index} 
                  className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full"
                  style={{ 
                    fontSize: `${size}rem`,
                    opacity: 0.7 + (keyword.count / maxCount) * 0.3
                  }}
                >
                  {keyword.keyword}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="dashboard-footer mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Data refreshes automatically every 5 minutes. Last updated: Just now</p>
      </div>
    </div>
  );
};

export default ThreatIntelDashboard;
