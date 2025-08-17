"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../database");
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'astroaudio-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    /**
     * Register a new user with proper password hashing
     */
    static async register(email, password, displayName) {
        const db = await (0, database_1.getDatabase)();
        // Check if user already exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        // Validate password strength
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        // Hash password with bcrypt
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const userId = (0, uuid_1.v4)();
        const user = {
            id: userId,
            email,
            display_name: displayName,
            default_genre: 'electronic',
            subscription_plan: 'free',
            subscription_status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await db.run('INSERT INTO users (id, email, display_name, password_hash, default_genre, subscription_plan, subscription_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [user.id, user.email, user.display_name, hashedPassword, user.default_genre, user.subscription_plan, user.subscription_status, user.created_at, user.updated_at]);
        // Log user activity
        await this.logUserActivity(userId, 'signup', { email, displayName });
        return user;
    }
    /**
     * Login user with proper password verification
     */
    static async login(email, password) {
        const db = await (0, database_1.getDatabase)();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Verify password
        if (user.password_hash) {
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }
        }
        else {
            // Handle legacy demo users
            if (password !== 'demo123') {
                throw new Error('Invalid credentials');
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        // Log user activity
        await this.logUserActivity(user.id, 'login', { email });
        return { user, token };
    }
    /**
     * Google OAuth login/registration
     */
    static async googleAuth(googleId, email, displayName, profileImage) {
        const db = await (0, database_1.getDatabase)();
        // Check if user exists with Google ID
        let user = await db.get('SELECT * FROM users WHERE google_id = ?', [googleId]);
        if (!user) {
            // Check if user exists with email
            user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
            if (user) {
                // Link existing account to Google
                await db.run('UPDATE users SET google_id = ?, updated_at = ? WHERE id = ?', [googleId, new Date().toISOString(), user.id]);
            }
            else {
                // Create new user
                const userId = (0, uuid_1.v4)();
                user = {
                    id: userId,
                    email,
                    display_name: displayName,
                    profile_image: profileImage,
                    google_id: googleId,
                    default_genre: 'electronic',
                    subscription_plan: 'free',
                    subscription_status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                await db.run('INSERT INTO users (id, email, display_name, profile_image, google_id, default_genre, subscription_plan, subscription_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [user.id, user.email, user.display_name, user.profile_image, user.google_id, user.default_genre, user.subscription_plan, user.subscription_status, user.created_at, user.updated_at]);
                await this.logUserActivity(userId, 'google_signup', { email, displayName });
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        await this.logUserActivity(user.id, 'google_login', { email });
        return { user, token };
    }
    /**
     * Request password reset
     */
    static async requestPasswordReset(email) {
        const db = await (0, database_1.getDatabase)();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            // Don't reveal if user exists
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour
        await db.run('UPDATE users SET reset_token = ?, reset_expires = ?, updated_at = ? WHERE id = ?', [resetToken, resetExpires.toISOString(), new Date().toISOString(), user.id]);
        // In production, send email with reset link
        console.log(`Password reset token for ${email}: ${resetToken}`);
        await this.logUserActivity(user.id, 'password_reset_requested', { email });
    }
    /**
     * Reset password with token
     */
    static async resetPassword(email, resetToken, newPassword) {
        const db = await (0, database_1.getDatabase)();
        const user = await db.get('SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_expires > ?', [email, resetToken, new Date().toISOString()]);
        if (!user) {
            throw new Error('Invalid or expired reset token');
        }
        // Validate new password
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password and clear reset token
        await db.run('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL, updated_at = ? WHERE id = ?', [hashedPassword, new Date().toISOString(), user.id]);
        await this.logUserActivity(user.id, 'password_reset_completed', { email });
    }
    /**
     * Verify JWT token
     */
    static async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const db = await (0, database_1.getDatabase)();
            const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
            return user || null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get user by ID
     */
    static async getUserById(userId) {
        const db = await (0, database_1.getDatabase)();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        return user || null;
    }
    /**
     * Update user profile
     */
    static async updateUser(userId, updates) {
        const db = await (0, database_1.getDatabase)();
        const updateFields = Object.keys(updates)
            .filter(key => key !== 'id' && key !== 'created_at' && key !== 'password_hash')
            .map(key => `${key} = ?`)
            .join(', ');
        const values = Object.values(updates).filter((_, index) => {
            const key = Object.keys(updates)[index];
            return key !== 'id' && key !== 'created_at' && key !== 'password_hash';
        });
        await db.run(`UPDATE users SET ${updateFields}, updated_at = ? WHERE id = ?`, [...values, new Date().toISOString(), userId]);
        const updatedUser = await this.getUserById(userId);
        if (!updatedUser) {
            throw new Error('User not found');
        }
        await this.logUserActivity(userId, 'profile_updated', { updatedFields: Object.keys(updates) });
        return updatedUser;
    }
    /**
     * Change password
     */
    static async changePassword(userId, currentPassword, newPassword) {
        const db = await (0, database_1.getDatabase)();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        if (user.password_hash) {
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }
        }
        else {
            // Handle legacy demo users
            if (currentPassword !== 'demo123') {
                throw new Error('Current password is incorrect');
            }
        }
        // Validate new password
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await db.run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [hashedPassword, new Date().toISOString(), userId]);
        await this.logUserActivity(userId, 'password_changed', {});
    }
    /**
     * Middleware to authenticate requests
     */
    static async authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, error: 'Access token required' });
        }
        try {
            const user = await this.verifyToken(token);
            if (!user) {
                return res.status(403).json({ success: false, error: 'Invalid token' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
    }
    /**
     * Optional authentication middleware
     */
    static async optionalAuth(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            try {
                const user = await this.verifyToken(token);
                if (user) {
                    req.user = user;
                }
            }
            catch (error) {
                // Ignore token errors for optional auth
            }
        }
        next();
    }
    /**
     * Log user activity for security and analytics
     */
    static async logUserActivity(userId, action, details) {
        try {
            const db = await (0, database_1.getDatabase)();
            await db.run('INSERT INTO user_activity (id, user_id, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), userId, action, JSON.stringify(details), '127.0.0.1', 'AstroAudio-API', new Date().toISOString()]);
        }
        catch (error) {
            console.error('Failed to log user activity:', error);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=index.js.map