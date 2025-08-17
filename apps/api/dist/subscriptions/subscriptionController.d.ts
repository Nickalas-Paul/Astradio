import { Request, Response } from 'express';
import { AuthRequest } from '../auth';
export declare class SubscriptionController {
    /**
     * Get all available subscription plans
     * GET /subscriptions/plans
     */
    static getPlans(req: Request, res: Response): Promise<void>;
    /**
     * Get user's current subscription
     * GET /subscriptions/current
     */
    static getCurrentSubscription(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Create checkout session for Stripe
     * POST /subscriptions/checkout
     */
    static createCheckoutSession(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Complete checkout session (called by Stripe webhook)
     * POST /subscriptions/complete-checkout
     */
    static completeCheckout(req: Request, res: Response): Promise<void>;
    /**
     * Cancel user subscription
     * POST /subscriptions/cancel
     */
    static cancelSubscription(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Downgrade user to free plan
     * POST /subscriptions/downgrade
     */
    static downgradeToFree(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Check if user has access to a feature
     * POST /subscriptions/check-access
     */
    static checkFeatureAccess(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get user's usage statistics
     * GET /subscriptions/usage
     */
    static getUserUsage(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Track usage for a user
     * POST /subscriptions/track-usage
     */
    static trackUsage(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get subscription analytics (admin only)
     * GET /subscriptions/analytics
     */
    static getAnalytics(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Simulate Stripe webhook (for development)
     * POST /subscriptions/webhook
     */
    static stripeWebhook(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=subscriptionController.d.ts.map