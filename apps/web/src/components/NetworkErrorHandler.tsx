'use client';
import React, { useState, useEffect } from 'react';

interface NetworkErrorHandlerProps {
  apiUrl: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export default function NetworkErrorHandler({ 
  apiUrl, 
  onRetry, 
  children 
}: NetworkErrorHandlerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [apiReachable, setApiReachable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkApiHealth = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiReachable(true);
      } else {
        setApiReachable(false);
      }
    } catch (error) {
      setApiReachable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check API health on mount
    checkApiHealth();

    // Set up periodic health checks
    const healthCheckInterval = setInterval(checkApiHealth, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(healthCheckInterval);
    };
  }, [apiUrl]);

  // Show error if offline or API is unreachable
  if (!isOnline || !apiReachable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">
            {!isOnline ? '📡' : '🔌'}
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-300">
            {!isOnline ? 'No Internet Connection' : 'API Server Unreachable'}
          </h1>
          <p className="text-gray-300 mb-6">
            {!isOnline 
              ? 'Please check your internet connection and try again.'
              : 'The Astradio API server appears to be offline. Please try again in a moment.'
            }
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                if (onRetry) onRetry();
                checkApiHealth();
              }}
              disabled={isChecking}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {isChecking ? 'Checking...' : 'Retry Connection'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="ml-3 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {/* Status indicators */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={isOnline ? 'text-green-300' : 'text-red-300'}>
                Internet: {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${apiReachable ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={apiReachable ? 'text-green-300' : 'text-red-300'}>
                API Server: {apiReachable ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Troubleshooting tips */}
          <div className="mt-6 text-xs text-gray-400">
            <p className="mb-2 font-semibold">Troubleshooting:</p>
            <ul className="text-left space-y-1">
              <li>• Check if the API server is running</li>
              <li>• Verify your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 