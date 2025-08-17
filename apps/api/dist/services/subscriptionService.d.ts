export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly' | 'one-time';
    features: string[];
    limits: {
        chartGenerations: number;
        audioDuration: number;
        exports: number;
        sandboxUses: number;
    };
}
export interface UserSubscription {
    userId: string;
    planId: string;
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate: Date;
    usage: {
        chartGenerations: number;
        audioDuration: number;
        exports: number;
        sandboxUses: number;
    };
}
export interface CheckoutSession {
    id: string;
    userId: string;
    planId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    stripeSessionId?: string;
    createdAt: Date;
}
export declare const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan>;
export declare class SubscriptionService {
    /**
     * Get subscription plan by ID
     */
    static getPlan(planId: string): SubscriptionPlan | null;
    /**
     * Get all available plans
     */
    static getAllPlans(): SubscriptionPlan[];
    /**
     * Get user's current subscription
     */
    static getUserSubscription(userId: string): Promise<UserSubscription | null>;
    /**
     * Check if user has access to a feature
     */
    static checkFeatureAccess(userId: string, feature: 'chartGenerations' | 'audioDuration' | 'exports' | 'sandboxUses'): Promise<boolean>;
    /**
     * Create checkout session for Stripe
     */
    static createCheckoutSession(userId: string, planId: string): Promise<CheckoutSession>;
    /**
     * Complete checkout session (called by Stripe webhook)
     */
    static completeCheckoutSession(sessionId: string, stripeSessionId: string): Promise<void>;
    /**
     * Cancel user subscription
     */
    static cancelSubscription(userId: string): Promise<void>;
    /**
     * Downgrade user to free plan
     */
    static downgradeToFree(userId: string): Promise<void>;
    /**
     * Track usage for a user
     */
    static trackUsage(userId: string, action: 'chart_generated' | 'audio_created' | 'export_created' | 'sandbox_used'): Promise<void>;
    /**
     * Get user's usage statistics
     */
    static getUserUsage(userId: string): Promise<{
        chartGenerations: number;
        audioDuration: number;
        exports: number;
        sandboxUses: number;
    }>;
    /**
     * Get subscription analytics
     */
    static getSubscriptionAnalytics(): Promise<{
        totalUsers: number;
        freeUsers: number;
        proUsers: number;
        revenue: number;
    }>;
    /**
     * Log subscription-related activity
     */
    private static logSubscriptionActivity;
}
//# sourceMappingURL=subscriptionService.d.ts.map