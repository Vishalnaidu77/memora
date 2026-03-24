'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { themes } from './theme';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('themeMode');

    if (saved === 'light' || saved === 'dark') {
      const frame = window.requestAnimationFrame(() => {
        setMode(saved);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    document.documentElement.dataset.theme = 'dark';
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({
    mode,
    theme: themes[mode],
    toggleTheme,
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
