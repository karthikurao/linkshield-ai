// frontend/src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(undefined); 
// ... (rest of the ThemeProvider code for animation logic) ...
// Ensure it does NOT have 'export const useTheme = ...' here.
export const ThemeProvider = ({ children }) => {
  // ... full code as provided in message ID d2s1m021 / previous correct versions
  const [theme, setTheme] = useState(/* ... */);
  const [overlayStyle, setOverlayStyle] = useState(/* ... */);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => { /* ... */ }, [theme]);

  const toggleThemeWithAnimation = () => { /* ... */ };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: toggleThemeWithAnimation, overlayStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};