import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthService, User } from './index';
import { getDatabase } from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'astroaudio-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthController {
  /**
   * User signup
   */
  static async signup(req: Request, res: Response) {
    try {
      const { email, password, name, birthChart } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        });
      }

      // Check if user already exists
      const db = await getDatabase();
      const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Create user
      const user = await AuthService.register(email, password, name);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Save birth chart if provided
      if (birthChart) {
        await db.run(
          'UPDATE users SET birth_chart = ? WHERE id = ?',
          [JSON.stringify(birthChart), user.id]
        );
      }

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.display_name,
            subscription_plan: user.subscription_plan,
            subscription_status: user.subscription_status
          },
          token,
          expires_in: JWT_EXPIRES_IN
        }
      });
    } catch (error) {
      console.error('Signup failed:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * User login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await AuthService.login(email, password);
      
      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.display_name,
            subscription_plan: result.user.subscription_plan,
            subscription_status: result.user.subscription_status
          },
          token: result.token,
          expires_in: JWT_EXPIRES_IN
        }
      });
    } catch (error) {
      console.error('Login failed:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  }

  /**
   * Password reset request
   */
  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const db = await getDatabase();
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          success: true,
          message: 'If an account with this email exists, a reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await db.run(
        'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
        [resetToken, resetExpires.toISOString(), user.id]
      );

      // In production, send email here
      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({
        success: true,
        message: 'If an account with this email exists, a reset link has been sent'
      });
    } catch (error) {
      console.error('Password reset request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process password reset request'
      });
    }
  }

  /**
   * Password reset confirmation
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        });
      }

      const db = await getDatabase();
      const user = await db.get(
        'SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?',
        [token, new Date().toISOString()]
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await db.run(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
        [hashedPassword, user.id]
      );

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request & { user?: User }, res: Response) {
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

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.display_name,
          birth_chart: user.birth_chart ? JSON.parse(user.birth_chart) : null,
          subscription_plan: user.subscription_plan,
          subscription_status: user.subscription_status,
          subscription_expires_at: user.subscription_expires_at,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Get profile failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request & { user?: User }, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { name, birthChart, defaultGenre } = req.body;
      const updates: any = {};

      if (name) updates.display_name = name;
      if (birthChart) updates.birth_chart = JSON.stringify(birthChart);
      if (defaultGenre) updates.default_genre = defaultGenre;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update'
        });
      }

      const updatedUser = await AuthService.updateUser(req.user.id, updates);

      res.json({
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.display_name,
          birth_chart: updatedUser.birth_chart ? JSON.parse(updatedUser.birth_chart) : null,
          default_genre: updatedUser.default_genre,
          subscription_plan: updatedUser.subscription_plan,
          subscription_status: updatedUser.subscription_status
        }
      });
    } catch (error) {
      console.error('Update profile failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  /**
   * Google OAuth callback (simplified for demo)
   */
  static async googleOAuth(req: Request, res: Response) {
    try {
      const { email, name, googleId } = req.body;

      if (!email || !name || !googleId) {
        return res.status(400).json({
          success: false,
          error: 'Google OAuth data incomplete'
        });
      }

      const db = await getDatabase();
      let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        // Create new user from Google OAuth
        const userId = uuidv4();
        user = {
          id: userId,
          email,
          display_name: name,
          google_id: googleId,
          default_genre: 'electronic',
          subscription_plan: 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await db.run(
          'INSERT INTO users (id, email, display_name, google_id, default_genre, subscription_plan, subscription_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [user.id, user.email, user.display_name, user.google_id, user.default_genre, user.subscription_plan, user.subscription_status, user.created_at, user.updated_at]
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.display_name,
            subscription_plan: user.subscription_plan,
            subscription_status: user.subscription_status
          },
          token,
          expires_in: JWT_EXPIRES_IN
        }
      });
    } catch (error) {
      console.error('Google OAuth failed:', error);
      res.status(500).json({
        success: false,
        error: 'OAuth authentication failed'
      });
    }
  }
} 