// frontend/src/pages/MockProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { UserCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const MockProfilePage = () => {
    const { user } = useAuth();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ 
        username: '',
        bio: 'LinkShield AI user',
        preferences: {
            notifications: true,
            theme: 'system'
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            // In a real app, we'd fetch this from the backend
            setFormData(prev => ({
                ...prev,
                username: user.username || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            // Handle nested properties like preferences.notifications
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            // Handle top-level properties
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            // In a real app, we'd send this to the backend API
            // For demo purposes, we'll just simulate a successful update
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error('Error updating profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEditing = () => {
        // Reset form data to original values and exit editing mode
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username || ''
            }));
        }
        setIsEditing(false);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-brand-accent to-blue-500 h-32"></div>
            
            <div className="px-6 py-4 relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
                    <div className="absolute -top-16 bg-white dark:bg-slate-700 p-1 rounded-full shadow-lg">
                        <div className="bg-gradient-to-br from-brand-accent to-blue-500 p-1 rounded-full">
                            <div className="bg-white dark:bg-slate-800 rounded-full p-1">
                                <UserCircleIcon className="h-24 w-24 text-slate-700 dark:text-slate-300" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-16 sm:mt-0 sm:ml-36 flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                {formData.username || 'User'}
                            </h1>
                            
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <PencilSquareIcon className="h-5 w-5 mr-2" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            {formData.bio}
                        </p>
                    </div>
                </div>
                
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        {successMessage}
                    </div>
                )}
                
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                        {error}
                    </div>
                )}
                
                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent dark:bg-slate-700 dark:text-slate-200"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows="3"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent dark:bg-slate-700 dark:text-slate-200"
                                ></textarea>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Preferences</h3>
                                
                                <div className="flex items-center mb-3">
                                    <input
                                        id="notifications"
                                        name="preferences.notifications"
                                        type="checkbox"
                                        checked={formData.preferences?.notifications}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-slate-300 rounded"
                                    />
                                    <label htmlFor="notifications" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                        Enable notifications
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-brand-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent ${
                                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Account Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Username</h4>
                                <p className="mt-1 text-slate-800 dark:text-slate-200">{formData.username || 'Not set'}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Account Type</h4>
                                <p className="mt-1 text-slate-800 dark:text-slate-200">Free Tier</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Notifications</h4>
                                <p className="mt-1 text-slate-800 dark:text-slate-200">
                                    {formData.preferences?.notifications ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockProfilePage;
