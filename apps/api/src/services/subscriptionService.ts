import { getDatabase } from '../database';
import { User } from '../auth';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    savedSessions: number;
    exportFormats: string[];
    remixEnabled: boolean;
    privateLinks: boolean;
  };
}

export interface SubscriptionStatus {
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  expiresAt?: string;
  features: string[];
  limits: {
    savedSessions: number;
    exportFormats: string[];
    remixEnabled: boolean;
    privateLinks: boolean;
  };
}

export class SubscriptionService {
  // Define available plans
  static readonly PLANS: Record<string, SubscriptionPlan> = {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
      features: [
        '3 saved sessions',
        'Basic export (MP3)',
        'Public sharing',
        'Community access'
      ],
      limits: {
        savedSessions: 3,
        exportFormats: ['mp3'],
        remixEnabled: false,
        privateLinks: false
      }
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Unlimited saved sessions',
        'All export formats (MIDI, WAV, MP3)',
        'Remix compositions',
        'Private sharing links',
        'Priority support',
        'Advanced analytics'
      ],
      limits: {
        savedSessions: -1, // Unlimited
        exportFormats: ['midi', 'wav', 'mp3'],
        remixEnabled: true,
        privateLinks: true
      }
    },
    yearly: {
      id: 'yearly',
      name: 'Pro (Yearly)',
      price: 99.99,
      currency: 'USD',
      interval: 'yearly',
      features: [
        'All Pro features',
        '2 months free',
        'Early access to new features'
      ],
      limits: {
        savedSessions: -1, // Unlimited
        exportFormats: ['midi', 'wav', 'mp3'],
        remixEnabled: true,
        privateLinks: true
      }
    }
  };

  /**
   * Get user's subscription status
   */
  static async getUserSubscription(userId: string): Promise<SubscriptionStatus> {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      throw new Error('User not found');
    }

    const plan = this.PLANS[user.subscription_plan] || this.PLANS.free;
    
    return {
      plan: user.subscription_plan,
      status: user.subscription_status as any,
      expiresAt: user.subscription_expires_at,
      features: plan.features,
      limits: plan.limits
    };
  }

  /**
   * Check if user can perform an action based on their plan
   */
  static async canPerformAction(userId: string, action: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    
    switch (action) {
      case 'save_session':
        return subscription.limits.savedSessions === -1 || 
               await this.getUserSessionCount(userId) < subscription.limits.savedSessions;
      
      case 'export_midi':
        return subscription.limits.exportFormats.includes('midi');
      
      case 'export_wav':
        return subscription.limits.exportFormats.includes('wav');
      
      case 'remix':
        return subscription.limits.remixEnabled;
      
      case 'private_links':
        return subscription.limits.privateLinks;
      
      default:
        return true;
    }
  }

  /**
   * Get user's session count
   */
  static async getUserSessionCount(userId: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
      [userId]
    );
    return result.count;
  }

  /**
   * Update user's subscription (for demo purposes)
   */
  static async updateUserSubscription(
    userId: string, 
    planId: string, 
    status: string = 'active'
  ): Promise<void> {
    const db = await getDatabase();
    
    if (!this.PLANS[planId]) {
      throw new Error('Invalid plan');
    }

    const expiresAt = planId === 'free' ? null : 
      new Date(Date.now() + (planId === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

    await db.run(
      `UPDATE users SET 
       subscription_plan = ?, 
       subscription_status = ?, 
       subscription_expires_at = ?,
       updated_at = ?
       WHERE id = ?`,
      [planId, status, expiresAt, new Date().toISOString(), userId]
    );
  }

  /**
   * Check subscription limits
   */
  static async checkSubscriptionLimits(userId: string): Promise<{
    canSaveSession: boolean;
    canExportMidi: boolean;
    canExportWav: boolean;
    canRemix: boolean;
    canUsePrivateLinks: boolean;
    sessionCount: number;
    sessionLimit: number;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const sessionCount = await this.getUserSessionCount(userId);
    
    return {
      canSaveSession: subscription.limits.savedSessions === -1 || sessionCount < subscription.limits.savedSessions,
      canExportMidi: subscription.limits.exportFormats.includes('midi'),
      canExportWav: subscription.limits.exportFormats.includes('wav'),
      canRemix: subscription.limits.remixEnabled,
      canUsePrivateLinks: subscription.limits.privateLinks,
      sessionCount,
      sessionLimit: subscription.limits.savedSessions
    };
  }

  /**
   * Get available plans
   */
  static getAvailablePlans(): SubscriptionPlan[] {
    return Object.values(this.PLANS);
  }

  /**
   * Process subscription upgrade (demo implementation)
   */
  static async processSubscriptionUpgrade(
    userId: string, 
    planId: string, 
    paymentMethod: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, you would integrate with Stripe here
      console.log(`💰 Processing subscription upgrade for user ${userId} to plan ${planId}`);
      console.log(`💳 Payment method: ${paymentMethod}`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user subscription
      await this.updateUserSubscription(userId, planId, 'active');
      
      return {
        success: true,
        message: `Successfully upgraded to ${this.PLANS[planId].name} plan`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Payment processing failed'
      };
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string): Promise<void> {
    await this.updateUserSubscription(userId, 'free', 'canceled');
  }

  /**
   * Get subscription usage analytics
   */
  static async getSubscriptionAnalytics(userId: string): Promise<{
    currentPlan: string;
    sessionsUsed: number;
    sessionsLimit: number;
    exportsThisMonth: number;
    features: string[];
  }> {
    const subscription = await this.getUserSubscription(userId);
    const sessionCount = await this.getUserSessionCount(userId);
    
    // In a real implementation, you'd track export usage
    const exportsThisMonth = 0; // Placeholder
    
    return {
      currentPlan: subscription.plan,
      sessionsUsed: sessionCount,
      sessionsLimit: subscription.limits.savedSessions,
      exportsThisMonth,
      features: subscription.features
    };
  }
} 