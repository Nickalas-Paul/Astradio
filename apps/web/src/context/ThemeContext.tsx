'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'night' | 'day';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('night');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('astradio-theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'night' || savedTheme === 'day')) {
      setThemeState(savedTheme);
    }
  }, []);

  // Update document class and localStorage when theme changes
  useEffect(() => {
    document.documentElement.classList.remove('theme-night', 'theme-day');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('astradio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'night' ? 'day' : 'night');
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 