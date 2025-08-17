"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const subscriptionService_1 = require("../services/subscriptionService");
const zod_1 = require("zod");
// Validation schemas
const createCheckoutSessionSchema = zod_1.z.object({
    planId: zod_1.z.string().refine(planId => Object.keys(subscriptionService_1.SUBSCRIPTION_PLANS).includes(planId), {
        message: 'Invalid plan ID'
    })
});
const completeCheckoutSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    stripeSessionId: zod_1.z.string()
});
class SubscriptionController {
    /**
     * Get all available subscription plans
     * GET /subscriptions/plans
     */
    static async getPlans(req, res) {
        try {
            const plans = subscriptionService_1.SubscriptionService.getAllPlans();
            res.json({
                success: true,
                data: plans
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch subscription plans'
            });
        }
    }
    /**
     * Get user's current subscription
     * GET /subscriptions/current
     */
    static async getCurrentSubscription(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const subscription = await subscriptionService_1.SubscriptionService.getUserSubscription(req.user.id);
            const usage = await subscriptionService_1.SubscriptionService.getUserUsage(req.user.id);
            res.json({
                success: true,
                data: {
                    subscription,
                    usage
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch subscription'
            });
        }
    }
    /**
     * Create checkout session for Stripe
     * POST /subscriptions/checkout
     */
    static async createCheckoutSession(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const validatedData = createCheckoutSessionSchema.parse(req.body);
            const checkoutSession = await subscriptionService_1.SubscriptionService.createCheckoutSession(req.user.id, validatedData.planId);
            // In production, you would create a Stripe checkout session here
            // For now, we'll return the session data
            res.json({
                success: true,
                data: {
                    sessionId: checkoutSession.id,
                    amount: checkoutSession.amount,
                    planId: checkoutSession.planId,
                    // In production, this would be a Stripe checkout URL
                    checkoutUrl: `/checkout/${checkoutSession.id}`
                }
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                });
            }
            else if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to create checkout session'
                });
            }
        }
    }
    /**
     * Complete checkout session (called by Stripe webhook)
     * POST /subscriptions/complete-checkout
     */
    static async completeCheckout(req, res) {
        try {
            const validatedData = completeCheckoutSchema.parse(req.body);
            await subscriptionService_1.SubscriptionService.completeCheckoutSession(validatedData.sessionId, validatedData.stripeSessionId);
            res.json({
                success: true,
                message: 'Checkout completed successfully'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors
                });
            }
            else if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to complete checkout'
                });
            }
        }
    }
    /**
     * Cancel user subscription
     * POST /subscriptions/cancel
     */
    static async cancelSubscription(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            await subscriptionService_1.SubscriptionService.cancelSubscription(req.user.id);
            res.json({
                success: true,
                message: 'Subscription cancelled successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to cancel subscription'
            });
        }
    }
    /**
     * Downgrade user to free plan
     * POST /subscriptions/downgrade
     */
    static async downgradeToFree(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            await subscriptionService_1.SubscriptionService.downgradeToFree(req.user.id);
            res.json({
                success: true,
                message: 'Successfully downgraded to free plan'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to downgrade subscription'
            });
        }
    }
    /**
     * Check if user has access to a feature
     * POST /subscriptions/check-access
     */
    static async checkFeatureAccess(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const { feature } = req.body;
            if (!feature || !['chartGenerations', 'audioDuration', 'exports', 'sandboxUses'].includes(feature)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid feature specified'
                });
                return;
            }
            const hasAccess = await subscriptionService_1.SubscriptionService.checkFeatureAccess(req.user.id, feature);
            res.json({
                success: true,
                data: {
                    hasAccess,
                    feature
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to check feature access'
            });
        }
    }
    /**
     * Get user's usage statistics
     * GET /subscriptions/usage
     */
    static async getUserUsage(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const usage = await subscriptionService_1.SubscriptionService.getUserUsage(req.user.id);
            const subscription = await subscriptionService_1.SubscriptionService.getUserSubscription(req.user.id);
            res.json({
                success: true,
                data: {
                    usage,
                    subscription
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch usage statistics'
            });
        }
    }
    /**
     * Track usage for a user
     * POST /subscriptions/track-usage
     */
    static async trackUsage(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const { action } = req.body;
            if (!action || !['chart_generated', 'audio_created', 'export_created', 'sandbox_used'].includes(action)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid action specified'
                });
                return;
            }
            await subscriptionService_1.SubscriptionService.trackUsage(req.user.id, action);
            res.json({
                success: true,
                message: 'Usage tracked successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to track usage'
            });
        }
    }
    /**
     * Get subscription analytics (admin only)
     * GET /subscriptions/analytics
     */
    static async getAnalytics(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            // In production, you'd check if user is admin
            // For now, we'll allow any authenticated user to see analytics
            const analytics = await subscriptionService_1.SubscriptionService.getSubscriptionAnalytics();
            res.json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch analytics'
            });
        }
    }
    /**
     * Simulate Stripe webhook (for development)
     * POST /subscriptions/webhook
     */
    static async stripeWebhook(req, res) {
        try {
            const { sessionId, stripeSessionId } = req.body;
            if (!sessionId || !stripeSessionId) {
                res.status(400).json({
                    success: false,
                    error: 'Session ID and Stripe session ID are required'
                });
                return;
            }
            await subscriptionService_1.SubscriptionService.completeCheckoutSession(sessionId, stripeSessionId);
            res.json({
                success: true,
                message: 'Webhook processed successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to process webhook'
            });
        }
    }
}
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscriptionController.js.map