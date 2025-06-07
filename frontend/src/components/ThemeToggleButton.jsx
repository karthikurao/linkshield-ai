// frontend/src/components/ThemeToggleButton.jsx
import React from 'react'; // Removed useRef
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme(); // toggleTheme is toggleThemeWithAnimation

  // No need for buttonRef for this animation type
  const handleClick = () => {
    toggleTheme(); // Call without arguments
  };

  return (
    <button
      // ref removed
      onClick={handleClick}
      className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent dark:focus:ring-offset-slate-900 transition-colors duration-200"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggleButton;