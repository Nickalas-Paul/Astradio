'use client';

import { useEffect, useState } from 'react';

interface AudioClientWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AudioClientWrapper({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-300 font-mystical">Loading Audio Interface...</p>
      </div>
    </div>
  )
}: AudioClientWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Handle user interaction for audio context
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Show fallback until client-side and user has interacted
  if (!isClient || !hasUserInteracted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 