import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatistics } from '../services/api';

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardStats = () => {
  const [stats, setStats] = useState({
    scansByResult: [],
    scansByDay: [],
    topPhishingDomains: [],
    threatCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from your API
    const fetchStats = async () => {
      try {
        setLoading(true);
        // const data = await getStatistics();
        
        // For demo purposes, using mock data
        const mockData = {
          scansByResult: [
            { name: 'Safe', value: 156 },
            { name: 'Phishing', value: 42 },
            { name: 'Suspicious', value: 23 },
          ],
          scansByDay: [
            { name: 'Mon', scans: 24 },
            { name: 'Tue', scans: 32 },
            { name: 'Wed', scans: 18 },
            { name: 'Thu', scans: 29 },
            { name: 'Fri', scans: 41 },
            { name: 'Sat', scans: 15 },
            { name: 'Sun', scans: 12 },
          ],
          topPhishingDomains: [
            { name: 'suspicious-bank.com', count: 8 },
            { name: 'login-secure-verify.net', count: 6 },
            { name: 'account-verification.co', count: 5 },
            { name: 'secure-login-portal.com', count: 4 },
            { name: 'verify-account-now.org', count: 3 },
          ],
          threatCategories: [
            { name: 'Financial', value: 18 },
            { name: 'Social Media', value: 12 },
            { name: 'E-commerce', value: 8 },
            { name: 'Email', value: 7 },
            { name: 'Other', value: 4 },
          ]
        };
        
        setStats(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center p-8">Loading statistics...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="dashboard-stats">
      <h2 className="text-2xl font-bold mb-6">Scan Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Scan Results Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Scan Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.scansByResult}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.scansByResult.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Scans by Day Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Scans by Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stats.scansByDay}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="scans" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Phishing Domains */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Phishing Domains</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={stats.topPhishingDomains}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Threat Categories */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Threat Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.threatCategories}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.threatCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
