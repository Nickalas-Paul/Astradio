"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const index_1 = require("./index");
const zod_1 = require("zod");
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    displayName: zod_1.z.string().optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
const googleAuthSchema = zod_1.z.object({
    googleId: zod_1.z.string(),
    email: zod_1.z.string().email('Invalid email format'),
    displayName: zod_1.z.string(),
    profileImage: zod_1.z.string().optional()
});
const passwordResetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format')
});
const passwordResetSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    resetToken: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters')
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters')
});
const updateProfileSchema = zod_1.z.object({
    display_name: zod_1.z.string().optional(),
    default_genre: zod_1.z.string().optional(),
    birth_chart: zod_1.z.string().optional(),
    profile_image: zod_1.z.string().optional()
});
class AuthController {
    /**
     * Register a new user
     * POST /auth/signup
     */
    static async register(req, res) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const user = await index_1.AuthService.register(validatedData.email, validatedData.password, validatedData.displayName);
            const token = await index_1.AuthService.login(validatedData.email, validatedData.password);
            res.status(201).json({
                success: true,
                data: {
                    user,
                    token: token.token
                },
                message: 'User registered successfully'
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
                    error: 'Internal server error'
                });
            }
        }
    }
    /**
     * Login user
     * POST /auth/login
     */
    static async login(req, res) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await index_1.AuthService.login(validatedData.email, validatedData.password);
            res.json({
                success: true,
                data: result,
                message: 'Login successful'
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
                res.status(401).json({
                    success: false,
                    error: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    }
    /**
     * Google OAuth authentication
     * POST /auth/google
     */
    static async googleAuth(req, res) {
        try {
            const validatedData = googleAuthSchema.parse(req.body);
            const result = await index_1.AuthService.googleAuth(validatedData.googleId, validatedData.email, validatedData.displayName, validatedData.profileImage);
            res.json({
                success: true,
                data: result,
                message: 'Google authentication successful'
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
                    error: 'Internal server error'
                });
            }
        }
    }
    /**
     * Request password reset
     * POST /auth/forgot-password
     */
    static async requestPasswordReset(req, res) {
        try {
            const validatedData = passwordResetRequestSchema.parse(req.body);
            await index_1.AuthService.requestPasswordReset(validatedData.email);
            res.json({
                success: true,
                message: 'Password reset email sent (check console for token in development)'
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
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    }
    /**
     * Reset password with token
     * POST /auth/reset-password
     */
    static async resetPassword(req, res) {
        try {
            const validatedData = passwordResetSchema.parse(req.body);
            await index_1.AuthService.resetPassword(validatedData.email, validatedData.resetToken, validatedData.newPassword);
            res.json({
                success: true,
                message: 'Password reset successful'
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
                    error: 'Internal server error'
                });
            }
        }
    }
    /**
     * Get current user profile
     * GET /auth/profile
     */
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            res.json({
                success: true,
                data: req.user
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    /**
     * Update user profile
     * PUT /auth/profile
     */
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const validatedData = updateProfileSchema.parse(req.body);
            const updatedUser = await index_1.AuthService.updateUser(req.user.id, validatedData);
            res.json({
                success: true,
                data: updatedUser,
                message: 'Profile updated successfully'
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
                    error: 'Internal server error'
                });
            }
        }
    }
    /**
     * Change password
     * POST /auth/change-password
     */
    static async changePassword(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const validatedData = changePasswordSchema.parse(req.body);
            await index_1.AuthService.changePassword(req.user.id, validatedData.currentPassword, validatedData.newPassword);
            res.json({
                success: true,
                message: 'Password changed successfully'
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
                    error: 'Internal server error'
                });
            }
        }
    }
    /**
     * Verify token validity
     * GET /auth/verify
     */
    static async verifyToken(req, res) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                res.status(401).json({
                    success: false,
                    error: 'No token provided'
                });
                return;
            }
            const user = await index_1.AuthService.verifyToken(token);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
                return;
            }
            res.json({
                success: true,
                data: { user }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    /**
     * Logout (client-side token removal)
     * POST /auth/logout
     */
    static async logout(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            // In a more sophisticated system, you might blacklist the token
            // For now, we'll just return success and let the client remove the token
            res.json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    /**
     * Get user by ID (for admin or public profiles)
     * GET /auth/users/:id
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await index_1.AuthService.getUserById(id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
                return;
            }
            // Return limited user info for public profiles
            const publicUser = {
                id: user.id,
                display_name: user.display_name,
                profile_image: user.profile_image,
                created_at: user.created_at
            };
            res.json({
                success: true,
                data: publicUser
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map