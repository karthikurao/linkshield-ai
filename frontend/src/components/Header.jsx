// frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import ThemeToggleButton from './ThemeToggleButton';
import { Link } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const { user, signOut, authStatus } = useAuthenticator(context => [context.user, context.signOut, context.authStatus]);
    const isAuthenticated = authStatus === 'authenticated';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const getDisplayName = () => {
        if (!user) return 'User';
        return user.username || user.attributes?.email || 'User';
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <header className="relative z-30 w-full py-3 px-4 sm:px-6 lg:px-8 shadow-md 
                         bg-white/90 dark:bg-slate-800/85 dark:backdrop-blur-lg
                         border-b border-slate-200 dark:border-slate-700/50
                         transition-colors duration-300 ease-in-out">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-3 cursor-pointer group">
                    <svg 
                        className="h-9 w-9 text-slate-800 dark:text-slate-200 group-hover:text-brand-accent dark:group-hover:text-brand-accent-dark transition-colors" 
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <path d="M9.5 9.5c.9-.9 2.1-.9 3 0s.9 2.1 0 3-.9 2.1 0 3c-.9.9-2.1.9-3 0s-.9-2.1 0-3"></path>
                        <path d="M14.5 14.5c-.9.9-2.1.9-3 0s-.9-2.1 0-3 .9-2.1 0-3c.9-.9 2.1-.9-3 0s.9 2.1 0 3"></path>
                    </svg>
                    <h1 className="text-2xl font-bold text-brand-accent dark:text-brand-accent-dark hidden sm:block">
                        LinkShield AI
                    </h1>
                </Link>
                  <div className="flex items-center space-x-4">
                    <nav className="hidden md:flex items-center space-x-6 mr-4 text-sm">
                        <Link to="/" className="text-slate-700 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">
                            Home
                        </Link>
                        <Link to="/advanced" className="text-slate-700 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">
                            Advanced Features
                        </Link>
                    </nav>                    <ThemeToggleButton />
                    
                    {isAuthenticated ? (
                        // --- Authenticated User View ---
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent dark:focus:ring-offset-slate-900">
                                <UserCircleIcon className="h-7 w-7 text-slate-600 dark:text-slate-300" />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                    <div className="py-1">
                                        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{getDisplayName()}</p>
                                        </div>
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 group flex items-center px-4 py-2 text-sm">
                                            <Cog6ToothIcon className="mr-3 h-5 w-5 text-slate-400" />
                                            Profile Settings
                                        </Link>
                                        <button onClick={() => { setDropdownOpen(false); signOut(); }} className="w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 group flex items-center px-4 py-2 text-sm">
                                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-slate-400" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // --- Guest User View ---
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-brand-accent rounded-lg hover:bg-brand-accent-hover transition-colors">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;