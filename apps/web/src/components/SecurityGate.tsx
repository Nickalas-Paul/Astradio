'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SecurityGateProps {
  feature: 'chartGenerations' | 'audioDuration' | 'exports' | 'sandboxUses' | 'premium';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export default function SecurityGate({ 
  feature, 
  children, 
  fallback, 
  requireAuth = true 
}: SecurityGateProps) {
  const { user, checkSubscription, getUsage } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, [user, feature]);

  const checkAccess = async () => {
    if (!user && requireAuth) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    if (!user && !requireAuth) {
      setHasAccess(true);
      setIsLoading(false);
      return;
    }

    try {
      // Check subscription status
      const subscription = await checkSubscription();
      const usageData = await getUsage();
      setUsage(usageData);

      if (!subscription) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const plan = subscription.subscription?.plan || 'free';
      const status = subscription.subscription?.status || 'active';

      // Check if subscription is active
      if (status !== 'active') {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Check feature-specific limits
      switch (feature) {
        case 'premium':
          setHasAccess(plan !== 'free');
          break;
        
        case 'chartGenerations':
          if (plan === 'free') {
            const currentUsage = usageData?.usage?.chartGenerations || 0;
            setHasAccess(currentUsage < 3); // Free plan: 3 generations per month
          } else {
            setHasAccess(true); // Pro/Yearly: unlimited
          }
          break;
        
        case 'audioDuration':
          if (plan === 'free') {
            setHasAccess(false); // Free plan: no extended audio
          } else {
            setHasAccess(true); // Pro/Yearly: extended audio
          }
          break;
        
        case 'exports':
          if (plan === 'free') {
            const currentUsage = usageData?.usage?.exports || 0;
            setHasAccess(currentUsage < 1); // Free plan: 1 export per month
          } else {
            setHasAccess(true); // Pro/Yearly: unlimited exports
          }
          break;
        
        case 'sandboxUses':
          if (plan === 'free') {
            setHasAccess(false); // Free plan: no sandbox
          } else {
            setHasAccess(true); // Pro/Yearly: sandbox access
          }
          break;
        
        default:
          setHasAccess(true);
      }
    } catch (error) {
      console.error('Failed to check access:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getUpgradeMessage = () => {
    switch (feature) {
      case 'premium':
        return 'Upgrade to Pro to access premium features';
      case 'chartGenerations':
        return 'Free plan limit reached. Upgrade to Pro for unlimited chart generations';
      case 'audioDuration':
        return 'Extended audio features require a Pro subscription';
      case 'exports':
        return 'Free plan export limit reached. Upgrade to Pro for unlimited exports';
      case 'sandboxUses':
        return 'Sandbox mode requires a Pro subscription';
      default:
        return 'This feature requires a Pro subscription';
    }
  };

  const getUsageInfo = () => {
    if (!usage) return null;

    switch (feature) {
      case 'chartGenerations':
        const chartUsage = usage.usage?.chartGenerations || 0;
        const chartLimit = user?.subscription?.plan === 'free' ? 3 : '∞';
        return `${chartUsage}/${chartLimit} chart generations used`;
      
      case 'exports':
        const exportUsage = usage.usage?.exports || 0;
        const exportLimit = user?.subscription?.plan === 'free' ? 1 : '∞';
        return `${exportUsage}/${exportLimit} exports used`;
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="glass-morphism rounded-2xl p-6 border border-amber-500/20">
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold mb-2 text-amber-300">Feature Restricted</h3>
        <p className="text-gray-300 mb-4">{getUpgradeMessage()}</p>
        
        {getUsageInfo() && (
          <p className="text-sm text-gray-400 mb-4">{getUsageInfo()}</p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/profile?tab=subscription'}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition-colors"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 