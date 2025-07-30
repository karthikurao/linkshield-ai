// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { updateUserProfileApi } from '../services/api';

const ProfilePage = () => {
    const { user } = useAuth();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [isLoading, setIsLoading] = useState(false); // For save button loading state
    const [error, setError] = useState(''); // For displaying errors from the API
    const [successMessage, setSuccessMessage] = useState(''); // For showing success feedback

    useEffect(() => {
        if (user) {
            setFormData({ 
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Send update to our backend API
            await updateUserProfileApi({
                name: formData.name,
                email: formData.email
            });
            
            // Show success message
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };    const handleCancel = () => {
        if (user) {
            setFormData({ 
                name: user.name || '',
                email: user.email || ''
            });
        }
        setIsEditing(false);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="w-full max-w-2xl">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-xl rounded-xl p-8 md:p-10 border border-slate-300/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <UserCircleIcon className="h-12 w-12 text-brand-accent dark:text-brand-accent-dark mr-4" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                Profile Settings
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                View and edit your personal information.
                            </p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button onClick={() => { setIsEditing(true); setSuccessMessage(''); setError(''); }} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-accent rounded-lg hover:bg-brand-accent-hover transition-colors">
                            <PencilSquareIcon className="h-5 w-5 mr-2" />
                            Edit
                        </button>
                    )}
                </div>

                <div className="border-t border-slate-300/60 dark:border-slate-700/60 pt-6">
                    {/* Display Success or Error Messages */}
                    {successMessage && <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm">{successMessage}</div>}
                    {error && <div className="mb-4 p-3 rounded-md bg-red-100 text-red-800 text-sm">{error}</div>}
                    
                    {isEditing ? (                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text" name="name" id="name" value={formData.name}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email" name="email" id="email" value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-slate-50 dark:bg-slate-700 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-brand-accent rounded-md hover:bg-brand-accent-hover disabled:opacity-50">
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</h3>
                                <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                    {formData.name || user?.attributes?.name || '(Not set)'}
                                </p>
                            </div>
                             <div>
                                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</h3>
                                <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                    {formData.email || user?.attributes?.email || '(Not set)'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;