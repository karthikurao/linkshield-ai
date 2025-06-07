// frontend/src/components/CommunityProtection.jsx
import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getCommunityReportsApi, submitCommunityReportApi } from '../services/api';

const CommunityProtection = () => {
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({ url: '', reason: '' });
  const [reportFilter, setReportFilter] = useState('all'); // 'all', 'pending', 'confirmed'
  const [userVotes, setUserVotes] = useState({});
  
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const isAuthenticated = authStatus === 'authenticated';
  
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCommunityReportsApi(reportFilter);
      setCommunityData(data);
    } catch (err) {
      console.error("Error fetching community data:", err);
      setError("Failed to load community data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Load any previously saved votes from localStorage
    const savedVotes = localStorage.getItem('communityVotes');
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
    
    fetchCommunityData();
  }, [reportFilter]);
  
  // Submit community report to API instead of using local mock data
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newReport.url.trim() || !newReport.reason.trim()) {
      alert("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      await submitCommunityReportApi(newReport);
      
      // Refresh data after submission
      await fetchCommunityData();
      
      // Reset form and close modal
      setNewReport({ url: '', reason: '' });
      setReportModalOpen(false);
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleVote = (reportId, voteType) => {
    if (!isAuthenticated) {
      alert("Please sign in to vote on community reports");
      return;
    }
    
    // Check if user already voted on this report
    if (userVotes[reportId] === voteType) {
      // Undo the vote
      const newVotes = {...userVotes};
      delete newVotes[reportId];
      setUserVotes(newVotes);
      localStorage.setItem('communityVotes', JSON.stringify(newVotes));
      
      // Update report votes
      const updatedReports = communityData.userReports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            votes: voteType === 'up' ? report.votes - 1 : report.votes + 1
          };
        }
        return report;
      });
      
      setCommunityData({
        ...communityData,
        userReports: updatedReports
      });
      
    } else {
      // Add or change vote
      const prevVote = userVotes[reportId];
      const newVotes = {
        ...userVotes,
        [reportId]: voteType
      };
      setUserVotes(newVotes);
      localStorage.setItem('communityVotes', JSON.stringify(newVotes));
      
      // Update report votes
      const updatedReports = communityData.userReports.map(report => {
        if (report.id === reportId) {
          let voteChange = voteType === 'up' ? 1 : -1;
          
          // If changing vote, double the effect
          if (prevVote) {
            voteChange *= 2;
          }
          
          return {
            ...report,
            votes: report.votes + voteChange
          };
        }
        return report;
      });
      
      setCommunityData({
        ...communityData,
        userReports: updatedReports
      });
    }
  };
  
  const filteredReports = communityData?.userReports.filter(report => {
    if (reportFilter === 'all') return true;
    return report.status === reportFilter;
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }
  
  if (!communityData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <p className="text-center text-slate-600 dark:text-slate-400">
          Unable to load community data. Please try again later.
        </p>
      </div>
    );
  }
  
  return (
    <div className="community-protection bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-md p-6 backdrop-blur-sm">
      <div className="community-header flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
            Community Protection
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Join forces with the community to identify and report phishing threats
          </p>
        </div>
        
        <button 
          onClick={() => setReportModalOpen(true)}
          className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-lg
                     transition-all duration-200 flex items-center shadow-sm"
          disabled={!isAuthenticated}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Report Suspicious URL
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="community-stats grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="stat-card bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center">
          <div className="text-3xl font-bold text-brand-accent">{communityData.communityStats.totalReports}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Reports</div>
        </div>
        <div className="stat-card bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center">
          <div className="text-3xl font-bold text-emerald-500">{communityData.communityStats.confirmedThreats}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Confirmed Threats</div>
        </div>
        <div className="stat-card bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-500">{communityData.communityStats.reportsThisWeek}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">This Week</div>
        </div>
        <div className="stat-card bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center">
          <div className="text-3xl font-bold text-purple-500">{communityData.communityStats.activeReporters}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Active Users</div>
        </div>
        <div className="stat-card bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm text-center">
          <div className="text-3xl font-bold text-amber-500">{communityData.communityStats.reportSuccess}%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Accuracy Rate</div>
        </div>
      </div>
      
      <div className="reports-and-leaderboard grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="user-reports col-span-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm p-4">
          <div className="reports-header flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Community Reports</h3>
            
            <div className="report-filters flex text-sm">
              <button 
                onClick={() => setReportFilter('all')}
                className={`px-3 py-1 rounded-l-md ${
                  reportFilter === 'all' 
                    ? 'bg-slate-200 dark:bg-slate-600 font-medium' 
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setReportFilter('pending')}
                className={`px-3 py-1 border-x border-slate-200 dark:border-slate-600 ${
                  reportFilter === 'pending' 
                    ? 'bg-slate-200 dark:bg-slate-600 font-medium' 
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                Pending
              </button>
              <button 
                onClick={() => setReportFilter('confirmed')}
                className={`px-3 py-1 rounded-r-md ${
                  reportFilter === 'confirmed' 
                    ? 'bg-slate-200 dark:bg-slate-600 font-medium' 
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                Confirmed
              </button>
            </div>
          </div>
          
          <div className="reports-list space-y-4">
            {filteredReports?.length > 0 ? (
              filteredReports.map(report => {
                // Format date
                const reportDate = new Date(report.reportedAt);
                const formattedDate = reportDate.toLocaleDateString();
                
                return (
                  <div key={report.id} className="report-item bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="report-content">
                        <div className="report-url font-medium break-all">
                          {report.reportedUrl}
                        </div>
                        <div className="report-reason text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {report.reportReason}
                        </div>
                        <div className="report-meta flex items-center text-xs text-slate-500 dark:text-slate-500 mt-2 space-x-4">
                          <span>Reported by: {report.reportedBy}</span>
                          <span>{formattedDate}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            report.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {report.status === 'confirmed' ? 'Confirmed Threat' : 'Pending Review'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="report-votes flex flex-col items-center">
                        <button 
                          onClick={() => handleVote(report.id, 'up')}
                          className={`p-1 rounded ${
                            userVotes[report.id] === 'up' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                          disabled={!isAuthenticated}
                          title={isAuthenticated ? "Agree this is suspicious" : "Sign in to vote"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium my-1">{report.votes}</span>
                        <button 
                          onClick={() => handleVote(report.id, 'down')}
                          className={`p-1 rounded ${
                            userVotes[report.id] === 'down' 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                          disabled={!isAuthenticated}
                          title={isAuthenticated ? "Disagree, seems legitimate" : "Sign in to vote"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No reports found matching your filter.
              </div>
            )}
          </div>
        </div>
        
        <div className="community-leaderboard bg-white dark:bg-slate-700 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">Top Contributors</h3>
          
          <div className="leaderboard-list space-y-3">
            {communityData.topContributors.map((contributor, index) => (
              <div key={index} className="contributor-item flex items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600">
                <div className={`rank-badge flex items-center justify-center w-8 h-8 rounded-full mr-3 
                                ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                  index === 1 ? 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300' :
                                  index === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                                  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                }`}>
                  {index + 1}
                </div>
                
                <div className="contributor-info flex-1">
                  <div className="contributor-name font-medium">
                    {contributor.username}
                  </div>
                  <div className="contributor-stats flex text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{contributor.reports} reports</span>
                    <span className="mx-2">•</span>
                    <span className="text-green-600 dark:text-green-400">{contributor.accuracy}% accuracy</span>
                  </div>
                </div>
                
                <div className="contributor-badge">
                  {index < 3 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="join-leaderboard mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Help protect the community by reporting suspicious URLs
              </p>
              {!isAuthenticated ? (
                <button className="w-full py-2 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-lg transition-colors text-sm">
                  Sign In to Contribute
                </button>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Report suspicious URLs to earn points and climb the leaderboard!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl shadow-lg p-6 mx-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Report Suspicious URL
            </h3>
            
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label htmlFor="reportUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Suspicious URL
                </label>
                <input
                  type="url"
                  id="reportUrl"
                  placeholder="https://suspicious-website.com"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  value={newReport.url}
                  onChange={(e) => setNewReport({...newReport, url: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="reportReason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Why is this URL suspicious?
                </label>
                <textarea
                  id="reportReason"
                  placeholder="Describe why you believe this URL is malicious or phishing..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  value={newReport.reason}
                  onChange={(e) => setNewReport({...newReport, reason: e.target.value})}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => setReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-lg"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityProtection;
