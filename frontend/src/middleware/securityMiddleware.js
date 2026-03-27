// Security Middleware for Frontend
import axios from 'axios';

// Rate limiting configuration
const rateLimitConfig = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests, please try again later.'
};

// API rate limiter
class ApiRateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = rateLimitConfig.windowMs;
    this.maxRequests = rateLimitConfig.maxRequests;
  }

  isAllowed(ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }
    
    const requestTimes = this.requests.get(ip);
    
    // Remove old requests outside the window
    const validRequests = requestTimes.filter(time => time > windowStart);
    this.requests.set(ip, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }
}

const rateLimiter = new ApiRateLimiter();

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// XSS protection
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF token management
export class CsrfProtection {
  constructor() {
    this.token = this.generateToken();
    this.storeToken();
  }

  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  storeToken() {
    sessionStorage.setItem('csrf_token', this.token);
  }

  getToken() {
    return sessionStorage.getItem('csrf_token');
  }

  validateToken(token) {
    return token === this.getToken();
  }

  refresh() {
    this.token = this.generateToken();
    this.storeToken();
    return this.token;
  }
}

// Secure API interceptor
export const setupSecureApi = () => {
  const csrfProtection = new CsrfProtection();
  
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Add CSRF token to headers for state-changing requests
      if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
        config.headers['X-CSRF-Token'] = csrfProtection.getToken();
      }
      
      // Add security headers
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      
      // Sanitize URL parameters
      if (config.params) {
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string') {
            config.params[key] = sanitizeInput(config.params[key]);
          }
        });
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle rate limiting
      if (error.response?.status === 429) {
        throw new Error(rateLimitConfig.message);
      }
      
      // Handle CSRF errors
      if (error.response?.status === 419) {
        csrfProtection.refresh();
        throw new Error('CSRF token expired. Please try again.');
      }
      
      return Promise.reject(error);
    }
  );
  
  return csrfProtection;
};

// Security monitoring
export class SecurityMonitor {
  constructor() {
    this.suspiciousActivities = [];
    this.maxSuspiciousActivities = 10;
  }

  logSuspiciousActivity(type, details) {
    const activity = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: this.getClientIP()
    };
    
    this.suspiciousActivities.push(activity);
    
    // Keep only recent activities
    if (this.suspiciousActivities.length > this.maxSuspiciousActivities) {
      this.suspiciousActivities.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Suspicious activity detected:', activity);
    }
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.reportSuspiciousActivity(activity);
    }
  }

  getClientIP() {
    // In a real application, this would come from the server
    return 'client-ip';
  }

  reportSuspiciousActivity(activity) {
    // Send to security monitoring service
    // This is a placeholder for actual implementation
    console.log('Security alert:', activity);
  }

  detectXSSAttempt(input) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  detectSQLInjectionAttempt(input) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\#|\/\*|\*\/)/gi,
      /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\b\s*\'\w*\'\s*=\s*\'\w*\')/gi
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }
}

// Input validation
export const validateInput = (input, rules) => {
  const errors = [];
  
  if (rules.required && (!input || input.trim() === '')) {
    errors.push('This field is required');
  }
  
  if (rules.minLength && input.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }
  
  if (rules.maxLength && input.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }
  
  if (rules.pattern && !rules.pattern.test(input)) {
    errors.push('Invalid format');
  }
  
  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
    errors.push('Invalid email format');
  }
  
  if (rules.numeric && !/^\d+$/.test(input)) {
    errors.push('Only numbers are allowed');
  }
  
  return errors;
};

// Export security utilities
export default {
  setupSecureApi,
  sanitizeInput,
  escapeHtml,
  CsrfProtection,
  SecurityMonitor,
  validateInput,
  rateLimiter
};
