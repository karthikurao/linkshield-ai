// frontend/src/context/ThemeProvider.jsx
import React, { useState, useEffect } from 'react';
import { ThemeContext } from './themeContextObject'; // Import the context object

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [overlayStyle, setOverlayStyle] = useState({
    clipPath: 'circle(0% at 100% 0%)',
    backgroundColor: 'transparent',
    visibility: 'hidden',
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleThemeWithAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const targetTheme = theme === 'light' ? 'dark' : 'light';
    const lightModeBgTarget = 'rgb(241, 245, 249)'; // slate-50 or slate-100
    const darkModeBgTarget = 'rgb(15, 23, 42)';    // slate-900
    const overlayColor = targetTheme === 'light' ? lightModeBgTarget : darkModeBgTarget;

    const startClipPath = targetTheme === 'dark' 
      ? 'circle(0% at 100% 0%)'  // Sunset: starts top-right
      : 'circle(0% at 0% 100%)'; // Sunrise: starts bottom-left

    const activeClipPath = targetTheme === 'dark'
      ? 'circle(150% at 100% 0%)' 
      : 'circle(150% at 0% 100%)';

    setOverlayStyle({
      backgroundColor: overlayColor,
      clipPath: startClipPath,
      visibility: 'visible',
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOverlayStyle(prev => ({ ...prev, clipPath: activeClipPath }));
      });
    });

    setTimeout(() => setTheme(targetTheme), 400); 

    setTimeout(() => {
      setOverlayStyle({
        backgroundColor: 'transparent',
        clipPath: startClipPath, 
        visibility: 'hidden',
      });
      setIsAnimating(false);
    }, 800); 
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: toggleThemeWithAnimation, overlayStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};