// frontend/src/hooks/useTheme.js
import { useContext } from 'react';
// Import ThemeContext from the new dedicated file
import { ThemeContext } from '../context/themeContextObject'; 

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};