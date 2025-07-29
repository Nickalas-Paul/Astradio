import { Request, Response } from 'express';
import { getDatabase } from '../database';
import { User } from '../auth';

interface SubscriptionRequest extends Request {
  user?: User;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'week' | 'month' | 'year' | 'one-time';
  features: string[];
  limits: {
    sessions: number;
    exports: number;
    sandbox_plays: number;
    overlay_access: boolean;
    friend_overlay: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    interval: 'month',
    features: [
      'Personal chart preview (1 min)',
      'Landing page daily chart',
      '1 sandbox use',
      'No export or remix options'
    ],
    limits: {
      sessions: 1,
      exports: 0,
      sandbox_plays: 1,
      overlay_access: false,
      friend_overlay: false
    }
  },
  pro_weekly: {
    id: 'pro_weekly',
    name: 'Pro Weekly',
    price: 4.99,
    interval: 'week',
    features: [
      'Full 6-minute compositions (30s per house)',
      'Unlimited generations',
      'Full sandbox mode',
      'Export options (MIDI, MP3, narration)',
      'Sidereal chart support',
      'AI music video visualizer',
      'Gallery of famous day charts'
    ],
    limits: {
      sessions: -1, // unlimited
      exports: -1,
      sandbox_plays: -1,
      overlay_access: true,
      friend_overlay: true
    }
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 12.99,
    interval: 'month',
    features: [
      'Full 6-minute compositions (30s per house)',
      'Unlimited generations',
      'Full sandbox mode',
      'Export options (MIDI, MP3, narration)',
      'Sidereal chart support',
      'AI music video visualizer',
      'Gallery of famous day charts'
    ],
    limits: {
      sessions: -1, // unlimited
      exports: -1,
      sandbox_plays: -1,
      overlay_access: true,
      friend_overlay: true
    }
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Annual',
    price: 99.99,
    interval: 'year',
    features: [
      'Full 6-minute compositions (30s per house)',
      'Unlimited generations',
      'Full sandbox mode',
      'Export options (MIDI, MP3, narration)',
      'Sidereal chart support',
      'AI music video visualizer',
      'Gallery of famous day charts',
      '2 months free (save $25.89)',
      'Early access to new features'
    ],
    limits: {
      sessions: -1, // unlimited
      exports: -1,
      sandbox_plays: -1,
      overlay_access: true,
      friend_overlay: true
    }
  }
};

export class SubscriptionController {
  /**
   * Get available subscription plans
   */
  static async getPlans(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          plans: Object.values(SUBSCRIPTION_PLANS)
        }
      });
    } catch (error) {
      console.error('Get plans failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription plans'
      });
    }
  }

  /**
   * Get user's current subscription status
   */
  static async getSubscriptionStatus(req: SubscriptionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const db = await getDatabase();
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get current plan details
      const currentPlan = SUBSCRIPTION_PLANS[user.subscription_plan] || SUBSCRIPTION_PLANS.free;

      // Get usage statistics
      const sessionCount = await db.get(
        'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
        [req.user.id]
      );

      const exportCount = await db.get(
        'SELECT COUNT(*) as count FROM user_exports WHERE user_id = ? AND created_at >= datetime("now", "-30 days")',
        [req.user.id]
      );

      // Check if subscription is expired
      const isExpired = user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date();

      res.json({
        success: true,
        data: {
          current_plan: {
            id: user.subscription_plan,
            name: currentPlan.name,
            price: currentPlan.price,
            interval: currentPlan.interval,
            features: currentPlan.features,
            limits: currentPlan.limits
          },
          subscription_status: isExpired ? 'expired' : user.subscription_status,
          expires_at: user.subscription_expires_at,
          usage: {
            sessions_used: sessionCount.count,
            sessions_limit: currentPlan.limits.sessions,
            exports_used: exportCount.count || 0,
            exports_limit: currentPlan.limits.exports
          },
          can_upgrade: user.subscription_plan === 'free',
          can_downgrade: user.subscription_plan.startsWith('pro_')
        }
      });
    } catch (error) {
      console.error('Get subscription status failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription status'
      });
    }
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(req: SubscriptionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { planId } = req.body;

      if (!planId || !SUBSCRIPTION_PLANS[planId]) {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan ID'
        });
      }

      const plan = SUBSCRIPTION_PLANS[planId];
      const db = await getDatabase();

      // For demo purposes, simulate Stripe checkout session
      // In production, integrate with actual Stripe API
      const checkoutSessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store checkout session
      await db.run(`
        INSERT INTO checkout_sessions (
          id, user_id, plan_id, amount, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        checkoutSessionId,
        req.user.id,
        planId,
        plan.price * 100, // Convert to cents
        'pending',
        new Date().toISOString()
      ]);

      res.json({
        success: true,
        data: {
          checkout_session_id: checkoutSessionId,
          plan: {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            interval: plan.interval
          },
          checkout_url: `https://checkout.stripe.com/pay/${checkoutSessionId}#fid=...`,
          // In production, this would be the actual Stripe checkout URL
        }
      });
    } catch (error) {
      console.error('Create checkout session failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create checkout session'
      });
    }
  }

  /**
   * Handle subscription webhook (Stripe webhook)
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const { event } = req.body;

      // In production, verify Stripe webhook signature
      // const signature = req.headers['stripe-signature'];
      // const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

      const db = await getDatabase();

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object, db);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object, db);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object, db);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object, db);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handling failed:', error);
      res.status(400).json({
        success: false,
        error: 'Webhook handling failed'
      });
    }
  }

  /**
   * Handle successful checkout completion
   */
  private static async handleCheckoutCompleted(session: any, db: any) {
    const { user_id, plan_id } = session.metadata;
    const plan = SUBSCRIPTION_PLANS[plan_id];

    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    let expiresAt: string;
    if (plan.interval === 'month') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (plan.interval === 'year') {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      // one-time purchase
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Update user subscription
    await db.run(`
      UPDATE users 
      SET subscription_plan = ?, subscription_status = 'active', subscription_expires_at = ?
      WHERE id = ?
    `, [plan_id, expiresAt, user_id]);

    // Update checkout session status
    await db.run(
      'UPDATE checkout_sessions SET status = ? WHERE id = ?',
      ['completed', session.id]
    );
  }

  /**
   * Handle successful payment
   */
  private static async handlePaymentSucceeded(invoice: any, db: any) {
    // Handle recurring payments
    const subscription = invoice.subscription;
    if (subscription) {
      const user = await db.get(
        'SELECT * FROM users WHERE stripe_customer_id = ?',
        [invoice.customer]
      );

      if (user) {
        const plan = SUBSCRIPTION_PLANS[subscription.metadata.plan_id];
        if (plan) {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          await db.run(`
            UPDATE users 
            SET subscription_status = 'active', subscription_expires_at = ?
            WHERE id = ?
          `, [expiresAt, user.id]);
        }
      }
    }
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(invoice: any, db: any) {
    const user = await db.get(
      'SELECT * FROM users WHERE stripe_customer_id = ?',
      [invoice.customer]
    );

    if (user) {
      await db.run(`
        UPDATE users 
        SET subscription_status = 'past_due'
        WHERE id = ?
      `, [user.id]);
    }
  }

  /**
   * Handle subscription cancellation
   */
  private static async handleSubscriptionCancelled(subscription: any, db: any) {
    const user = await db.get(
      'SELECT * FROM users WHERE stripe_customer_id = ?',
      [subscription.customer]
    );

    if (user) {
      await db.run(`
        UPDATE users 
        SET subscription_plan = 'free', subscription_status = 'cancelled'
        WHERE id = ?
      `, [user.id]);
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(req: SubscriptionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const db = await getDatabase();
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

      if (!user || !user.subscription_plan.startsWith('pro_')) {
        return res.status(400).json({
          success: false,
          error: 'No active subscription to cancel'
        });
      }

      // In production, cancel with Stripe
      // await stripe.subscriptions.del(user.stripe_subscription_id);

      // For demo, immediately downgrade to free
      await db.run(`
        UPDATE users 
        SET subscription_plan = 'free', subscription_status = 'cancelled'
        WHERE id = ?
      `, [req.user.id]);

      res.json({
        success: true,
        data: {
          message: 'Subscription cancelled successfully',
          new_plan: 'free'
        }
      });
    } catch (error) {
      console.error('Cancel subscription failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      });
    }
  }

  /**
   * Check if user can perform action based on subscription
   */
  static async checkActionLimit(req: SubscriptionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { action } = req.body;
      const db = await getDatabase();
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const plan = SUBSCRIPTION_PLANS[user.subscription_plan] || SUBSCRIPTION_PLANS.free;
      const isExpired = user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date();

      let canPerform = true;
      let reason = '';

      switch (action) {
        case 'save_session':
          if (plan.limits.sessions !== -1) {
            const sessionCount = await db.get(
              'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
              [req.user.id]
            );
            if (sessionCount.count >= plan.limits.sessions) {
              canPerform = false;
              reason = 'Session limit reached. Upgrade to Pro for unlimited sessions.';
            }
          }
          break;

        case 'export':
          if (plan.limits.exports !== -1) {
            const exportCount = await db.get(
              'SELECT COUNT(*) as count FROM user_exports WHERE user_id = ? AND created_at >= datetime("now", "-30 days")',
              [req.user.id]
            );
            if ((exportCount.count || 0) >= plan.limits.exports) {
              canPerform = false;
              reason = 'Export limit reached. Upgrade to Pro for unlimited exports.';
            }
          }
          break;

        case 'overlay_access':
          if (!plan.limits.overlay_access) {
            canPerform = false;
            reason = 'Overlay functionality requires Pro subscription.';
          }
          break;

        case 'friend_overlay':
          if (!plan.limits.friend_overlay) {
            canPerform = false;
            reason = 'Friend overlay compatibility requires Pro subscription.';
          }
          break;

        default:
          canPerform = false;
          reason = 'Unknown action';
      }

      if (isExpired) {
        canPerform = false;
        reason = 'Subscription expired. Please renew to continue.';
      }

      res.json({
        success: true,
        data: {
          can_perform: canPerform,
          reason,
          current_plan: user.subscription_plan,
          subscription_status: user.subscription_status,
          expires_at: user.subscription_expires_at
        }
      });
    } catch (error) {
      console.error('Check action limit failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check action limit'
      });
    }
  }
} 