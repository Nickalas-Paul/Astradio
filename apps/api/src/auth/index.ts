import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  profile_image?: string;
  birth_chart?: string; // JSON string of birth chart data
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

const JWT_SECRET = process.env.JWT_SECRET || 'astroaudio-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, displayName?: string): Promise<User> {
    const db = await getDatabase();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = uuidv4();
    const user: User = {
      id: userId,
      email,
      display_name: displayName,
      default_genre: 'electronic',
      subscription_plan: 'free',
      subscription_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.run(
      'INSERT INTO users (id, email, display_name, password_hash, default_genre, subscription_plan, subscription_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user.id, user.email, user.display_name, hashedPassword, user.default_genre, user.subscription_plan, user.subscription_status, user.created_at, user.updated_at]
    );

    return user;
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const db = await getDatabase();
    
    // For demo purposes, we'll use a simple password check
    // In production, you'd store hashed passwords in the database
    if (password !== 'demo123') {
      throw new Error('Invalid credentials');
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      // Create demo user if doesn't exist
      const newUser = await this.register(email, password);
      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      return { user: newUser, token };
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return { user, token };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      const db = await getDatabase();
      const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    return user || null;
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const db = await getDatabase();
    
    const updateFields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter((_, index) => 
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'created_at'
    );

    await db.run(
      `UPDATE users SET ${updateFields}, updated_at = ? WHERE id = ?`,
      [...values, new Date().toISOString(), userId]
    );

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  /**
   * Middleware to authenticate requests
   */
  static async authenticateToken(req: AuthRequest, res: any, next: any): Promise<void> {
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
    } catch (error) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
  }

  /**
   * Optional authentication middleware
   */
  static async optionalAuth(req: AuthRequest, res: any, next: any): Promise<void> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = await this.verifyToken(token);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }

    next();
  }
} 