'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

interface StripePaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StripePayment({ onSuccess, onCancel }: StripePaymentProps) {
  const { user, checkSubscription, supabase } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        '3 chart generations per month',
        'Basic audio features',
        'Standard export',
        'Community access'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      interval: 'month',
      features: [
        'Unlimited chart generations',
        'Advanced audio features',
        'High-quality exports',
        'Priority support',
        'Custom genres',
        'Sandbox mode'
      ],
      popular: true
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 99.99,
      interval: 'year',
      features: [
        'All Pro features',
        '2 months free',
        'Early access to new features',
        'Exclusive content',
        'Advanced analytics'
      ]
    }
  ];

  useEffect(() => {
    loadCurrentSubscription();
  }, []);

  const loadCurrentSubscription = async () => {
    if (!user) return;
    
    try {
      const subscription = await checkSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      
      // Get Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      // Create checkout session
      const response = await fetch(`${API_BASE}/api/subscriptions/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();
      
      // In production, this would redirect to Stripe Checkout
      // For now, we'll simulate the checkout process
      await simulateCheckout(result.data.sessionId, result.data.stripeSessionId);
      
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateCheckout = async (sessionId: string, stripeSessionId: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No session found');
    }
    
    await fetch(`${API_BASE}/api/subscriptions/webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session!.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        stripeSessionId
      }),
    });
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      const response = await fetch(`${API_BASE}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await loadCurrentSubscription();
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      const response = await fetch(`${API_BASE}/api/subscriptions/downgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session!.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to downgrade subscription');
      }

      await loadCurrentSubscription();
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to downgrade subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
        <h3 className="text-xl font-semibold mb-4 text-emerald-300">Subscription Plans</h3>
        <p className="text-gray-300 mb-4">Please log in to view subscription options.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-xl font-semibold mb-4 text-emerald-300">Current Subscription</h3>
          <div className="space-y-2">
            <p className="text-gray-300">
              <span className="font-semibold">Plan:</span> {currentSubscription.subscription?.plan || 'Free'}
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">Status:</span> {currentSubscription.subscription?.status || 'Active'}
            </p>
            {currentSubscription.subscription?.currentPeriodEnd && (
              <p className="text-gray-300">
                <span className="font-semibold">Next billing:</span> {new Date(currentSubscription.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {currentSubscription.subscription?.plan !== 'free' && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Cancel Subscription'}
              </button>
              <button
                onClick={handleDowngrade}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Downgrade to Free'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-morphism rounded-2xl p-6 border transition-all ${
              selectedPlan === plan.id
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-emerald-500/20 hover:border-emerald-500/40'
            } ${plan.popular ? 'relative' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-emerald-300 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-white mb-1">
                ${plan.price}
                <span className="text-lg text-gray-400">/{plan.interval}</span>
              </div>
              {plan.price === 0 && (
                <p className="text-gray-400 text-sm">Forever free</p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isLoading || currentSubscription?.subscription?.plan === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-emerald-600 text-white'
                    : currentSubscription?.subscription?.plan === plan.id
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {currentSubscription?.subscription?.plan === plan.id
                  ? 'Current Plan'
                  : isLoading
                  ? 'Processing...'
                  : `Upgrade to ${plan.name}`}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Subscribe Button */}
      {selectedPlan && selectedPlan !== 'free' && (
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-xl font-semibold mb-4 text-emerald-300">Complete Subscription</h3>
          <p className="text-gray-300 mb-4">
            You're about to subscribe to the {plans.find(p => p.id === selectedPlan)?.name} plan.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </button>
            <button
              onClick={() => setSelectedPlan(null)}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="glass-morphism rounded-2xl p-6 border border-red-500/20">
          <p className="text-red-300">❌ {error}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="glass-morphism rounded-2xl p-6 border border-blue-500/20">
        <h4 className="text-lg font-semibold mb-2 text-blue-300">🔒 Secure Payment</h4>
        <p className="text-gray-300 text-sm">
          All payments are processed securely through Stripe. Your payment information is never stored on our servers.
        </p>
      </div>
    </div>
  );
} 