import { Request } from 'express';
export interface User {
    id: string;
    email: string;
    display_name?: string;
    profile_image?: string;
    birth_chart?: string;
    default_genre: string;
    subscription_plan: string;
    subscription_status: string;
    subscription_expires_at?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    google_id?: string;
    password_hash?: string;
    reset_token?: string;
    reset_expires?: string;
    created_at: string;
    updated_at: string;
}
export interface AuthRequest extends Request {
    user?: User | null;
}
export declare class AuthService {
    /**
     * Register a new user with proper password hashing
     */
    static register(email: string, password: string, displayName?: string): Promise<User>;
    /**
     * Login user with proper password verification
     */
    static login(email: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Google OAuth login/registration
     */
    static googleAuth(googleId: string, email: string, displayName: string, profileImage?: string): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Request password reset
     */
    static requestPasswordReset(email: string): Promise<void>;
    /**
     * Reset password with token
     */
    static resetPassword(email: string, resetToken: string, newPassword: string): Promise<void>;
    /**
     * Verify JWT token
     */
    static verifyToken(token: string): Promise<User | null>;
    /**
     * Get user by ID
     */
    static getUserById(userId: string): Promise<User | null>;
    /**
     * Update user profile
     */
    static updateUser(userId: string, updates: Partial<User>): Promise<User>;
    /**
     * Change password
     */
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    /**
     * Middleware to authenticate requests
     */
    static authenticateToken(req: AuthRequest, res: any, next: any): Promise<void>;
    /**
     * Optional authentication middleware
     */
    static optionalAuth(req: AuthRequest, res: any, next: any): Promise<void>;
    /**
     * Log user activity for security and analytics
     */
    private static logUserActivity;
}
//# sourceMappingURL=index.d.ts.map