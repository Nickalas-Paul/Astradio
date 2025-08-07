// Frontend Security Utilities for Astradio
// Handles input sanitization, XSS prevention, and data validation

import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and sequences
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
};

// Sanitize birth data inputs
export const sanitizeBirthData = (data: {
  date?: string;
  time?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
}) => {
  return {
    date: sanitizeInput(data.date || ''),
    time: sanitizeInput(data.time || ''),
    location: sanitizeInput(data.location || ''),
    latitude: typeof data.latitude === 'number' ? 
      Math.max(-90, Math.min(90, data.latitude)) : 0,
    longitude: typeof data.longitude === 'number' ? 
      Math.max(-180, Math.min(180, data.longitude)) : 0,
    timezone: typeof data.timezone === 'number' ? 
      Math.max(-12, Math.min(14, data.timezone)) : 0
  };
};

// Validate date format (YYYY-MM-DD)
export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && 
         parsedDate.getFullYear() >= 1900 && 
         parsedDate.getFullYear() <= 2100;
};

// Validate time format (HH:MM)
export const validateTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Validate coordinates
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Sanitize HTML content for safe rendering
export const sanitizeHTML = (html: string): string => {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'div', 'p'],
      ALLOWED_ATTR: ['class', 'id']
    });
  }
  return html.replace(/[<>]/g, '');
};

// Escape HTML entities for safe text rendering
export const escapeHTML = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Validate and sanitize user-generated content
export const sanitizeUserContent = (content: string): string => {
  return sanitizeInput(content)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 500); // Limit user content length
};

// Secure API URL construction
export const buildSecureAPIUrl = (endpoint: string): string => {
  // Production API URL - hard-coded to Render until env works
  const productionUrl = process.env.NEXT_PUBLIC_API_URL || 'https://astradio-api.onrender.com';
  // Development API URL
  const developmentUrl = 'https://astradio-api.onrender.com';
  
  const baseUrl = process.env.NODE_ENV === 'production' ? productionUrl : developmentUrl;
  const sanitizedEndpoint = sanitizeInput(endpoint.replace(/^\/+/, ''));
  
  // If baseUrl already includes /api, don't add it again
  const apiPath = baseUrl.includes('/api') ? '' : '/api';
  return `${baseUrl}${apiPath}/${sanitizedEndpoint}`;
};

// Validate environment variables
export const validateEnvironment = (): void => {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn('Missing required environment variables:', missingVars);
  }
  
  // Ensure no secrets are exposed in public variables
  const sensitivePatterns = [
    /secret/i,
    /key/i,
    /password/i,
    /token/i
  ];
  
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(key)) {
          console.error(`SECURITY WARNING: Sensitive variable exposed in public env: ${key}`);
        }
      });
    }
  });
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const sanitizedValue = sanitizeInput(value);
      localStorage.setItem(sanitizedKey, sanitizedValue);
    } catch (error) {
      console.error('Failed to set secure storage item:', error);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      const sanitizedKey = sanitizeInput(key);
      return localStorage.getItem(sanitizedKey);
    } catch (error) {
      console.error('Failed to get secure storage item:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      console.error('Failed to remove secure storage item:', error);
    }
  }
};

// Rate limiting for client-side requests
class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 10;

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const key = `${endpoint}_${this.getClientId()}`;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    this.requests.set(key, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }

  private getClientId(): string {
    // Simple client ID based on user agent and screen size
    return `${navigator.userAgent}_${screen.width}x${screen.height}`;
  }
}

export const clientRateLimiter = new ClientRateLimiter();

// Initialize security on app startup
export const initializeSecurity = (): void => {
  validateEnvironment();
  
  // Disable console in production
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
  }
  
  // Add security headers to meta tags
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
  document.head.appendChild(meta);
}; 