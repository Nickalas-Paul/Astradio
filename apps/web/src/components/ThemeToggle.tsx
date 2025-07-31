'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-mystical text-gray-400">
        Theme
      </span>
      
      <button
        onClick={toggleTheme}
        className="relative w-16 h-8 bg-gray-600 rounded-full p-1 transition-colors duration-300 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}
      >
        <motion.div
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
          animate={{
            x: theme === 'night' ? 0 : 32,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          <motion.div
            animate={{
              rotate: theme === 'night' ? 0 : 180,
            }}
            transition={{
              duration: 0.3
            }}
          >
            {theme === 'night' ? (
              <span className="text-yellow-500 text-sm">🌙</span>
            ) : (
              <span className="text-orange-500 text-sm">☀️</span>
            )}
          </motion.div>
        </motion.div>
        
        {/* Background gradient */}
        <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20" />
      </button>
      
      <span className="text-sm font-mystical text-gray-400 capitalize">
        {theme} mode
      </span>
    </div>
  );
} 