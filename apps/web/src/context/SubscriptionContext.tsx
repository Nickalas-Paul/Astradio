'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserTier = 'free' | 'premium';

export interface SubscriptionState {
  tier: UserTier;
  isActive: boolean;
  expiresAt?: string;
  features: {
    expandedCompositions: boolean;
    unlimitedLibrary: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
  };
}

export interface DurationConfig {
  duration: 'free' | 'premium';
  secondsPerHouse: number;
  totalDuration: number;
  description: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionState;
  isLoading: boolean;
  upgradeToPremium: () => Promise<void>;
  downgradeToFree: () => Promise<void>;
  getDurationConfig: (tier?: UserTier) => DurationConfig;
  isFeatureEnabled: (feature: keyof SubscriptionState['features']) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  tier: 'free',
  isActive: true,
  features: {
    expandedCompositions: false,
    unlimitedLibrary: false,
    prioritySupport: false,
    advancedAnalytics: false,
  },
};

const PREMIUM_SUBSCRIPTION: SubscriptionState = {
  tier: 'premium',
  isActive: true,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  features: {
    expandedCompositions: true,
    unlimitedLibrary: true,
    prioritySupport: true,
    advancedAnalytics: true,
  },
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load subscription from localStorage
    const savedSubscription = localStorage.getItem('astradio-subscription');
    if (savedSubscription) {
      try {
        const parsed = JSON.parse(savedSubscription);
        setSubscription(parsed);
      } catch (error) {
        console.error('Failed to parse saved subscription:', error);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save subscription to localStorage
    localStorage.setItem('astradio-subscription', JSON.stringify(subscription));
  }, [subscription]);

  const upgradeToPremium = async () => {
    setIsLoading(true);
    try {
      // Mock premium upgrade - replace with real payment processing
      setSubscription(PREMIUM_SUBSCRIPTION);
      console.log('Upgraded to premium subscription');
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downgradeToFree = async () => {
    setIsLoading(true);
    try {
      // Mock downgrade to free
      setSubscription(DEFAULT_SUBSCRIPTION);
      console.log('Downgraded to free subscription');
    } catch (error) {
      console.error('Failed to downgrade to free:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDurationConfig = (tier?: UserTier): DurationConfig => {
    const userTier = tier || subscription.tier;
    
    if (userTier === 'premium') {
      return {
        duration: 'premium',
        secondsPerHouse: 30,
        totalDuration: 360, // 6 minutes
        description: 'Expanded composition with 30 seconds per house for deeper exploration'
      };
    } else {
      return {
        duration: 'free',
        secondsPerHouse: 5,
        totalDuration: 60, // 1 minute
        description: 'Standard composition with 5 seconds per house'
      };
    }
  };

  const isFeatureEnabled = (feature: keyof SubscriptionState['features']): boolean => {
    return subscription.features[feature];
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isLoading,
      upgradeToPremium,
      downgradeToFree,
      getDurationConfig,
      isFeatureEnabled,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 