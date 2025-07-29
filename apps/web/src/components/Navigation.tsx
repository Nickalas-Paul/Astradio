'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/chart', label: 'Chart', icon: '🌌' },
    { href: '/overlay', label: 'Overlay', icon: '🎵' },
    { href: '/sandbox', label: 'Sandbox', icon: '🧪' },
    { href: '/moments', label: 'Moments', icon: '✨' },
    { href: '/jam', label: 'Jam', icon: '🎸' },
    { href: '/vibes', label: 'Vibes', icon: '🎭' },
    { href: '/transits', label: 'Transits', icon: '🔄' },
    { href: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🌟</span>
            </div>
            <span className="text-xl font-bold text-white">Astradio</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-300 hover:text-emerald-400 transition-colors">
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div className="text-xs">{item.label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
} 