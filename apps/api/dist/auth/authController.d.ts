import { Request, Response } from 'express';
import { AuthRequest } from './index';
export declare class AuthController {
    /**
     * Register a new user
     * POST /auth/signup
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * Login user
     * POST /auth/login
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * Google OAuth authentication
     * POST /auth/google
     */
    static googleAuth(req: Request, res: Response): Promise<void>;
    /**
     * Request password reset
     * POST /auth/forgot-password
     */
    static requestPasswordReset(req: Request, res: Response): Promise<void>;
    /**
     * Reset password with token
     * POST /auth/reset-password
     */
    static resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * Get current user profile
     * GET /auth/profile
     */
    static getProfile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update user profile
     * PUT /auth/profile
     */
    static updateProfile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Change password
     * POST /auth/change-password
     */
    static changePassword(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Verify token validity
     * GET /auth/verify
     */
    static verifyToken(req: Request, res: Response): Promise<void>;
    /**
     * Logout (client-side token removal)
     * POST /auth/logout
     */
    static logout(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get user by ID (for admin or public profiles)
     * GET /auth/users/:id
     */
    static getUserById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map