'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GenreSelector from './GenreSelector';
import ThemeToggle from './ThemeToggle';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/audio-lab', label: '🎛️ Audio Lab' },
  { href: '/chart', label: 'Chart' },
  { href: '/overlay', label: 'Overlay' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/community', label: 'Community' },
  { href: '/moments', label: 'Moments' },
  { href: '/jam', label: 'Jam' },
];

const authenticatedNavItems = [
  { href: '/', label: 'Home' },
  { href: '/audio-lab', label: '🎛️ Audio Lab' },
  { href: '/chart', label: 'Chart' },
  { href: '/overlay', label: 'Overlay' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/community', label: 'Community' },
  { href: '/friends', label: 'Friends' },
  { href: '/moments', label: 'Moments' },
  { href: '/jam', label: 'Jam' },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-white font-mystical tracking-wide">
                Astradio
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {(user ? authenticatedNavItems : navItems).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mystical tracking-wide transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-emerald-300 cosmic-glow-text'
                      : 'text-gray-300 hover:text-emerald-300 hover:underline'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-6">
              <GenreSelector />
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-mystical">{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-red-300 transition-colors font-mystical"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-300 hover:text-emerald-300 transition-colors font-mystical"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="btn-cosmic px-4 py-2 rounded-xl font-mystical text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-700">
              <div className="flex flex-col gap-4">
                {(user ? authenticatedNavItems : navItems).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`font-mystical tracking-wide transition-all duration-200 ${
                      pathname === item.href
                        ? 'text-emerald-300 cosmic-glow-text'
                        : 'text-gray-300 hover:text-emerald-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile Controls */}
                <div className="pt-4 border-t border-gray-700 gap-4 flex flex-col">
                  <GenreSelector />
                  <ThemeToggle />
                  
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-gray-300 hover:text-emerald-300 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-mystical">{user.username}</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-gray-300 hover:text-red-300 transition-colors font-mystical text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          handleAuthClick('login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-gray-300 hover:text-emerald-300 transition-colors font-mystical text-left"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          handleAuthClick('signup');
                          setIsMobileMenuOpen(false);
                        }}
                        className="btn-cosmic px-4 py-2 rounded-xl font-mystical text-sm"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
} 