const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    // Use IP address as key, or user ID if authenticated
    return req.user ? req.user.id : req.ip;
  },
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // Time window in milliseconds (15 minutes)
  blockDuration: 60 * 60, // Block for 1 hour if limit exceeded
});

// Rate limiting middleware
async function setupRateLimiting() {
  return async (req, res, next) => {
    try {
      await rateLimiter.consume(req.user ? req.user.id : req.ip);
      next();
    } catch (rejRes) {
      // Rate limit exceeded
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      
      res.set('Retry-After', retryAfter);
      res.set('X-RateLimit-Limit', rateLimiter.points);
      res.set('X-RateLimit-Remaining', 0);
      res.set('X-RateLimit-Reset', new Date(Date.now() + rejRes.msBeforeNext).toISOString());
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter
      });
    }
  };
}

// Specific rate limiters for different endpoints
const authRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 5, // 5 attempts
  duration: 15 * 60, // 15 minutes
  blockDuration: 60 * 60, // 1 hour block
});

const aiRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
  points: 20, // 20 AI requests
  duration: 60 * 60, // 1 hour
  blockDuration: 30 * 60, // 30 minutes block
});

// Authentication rate limiting middleware
async function authRateLimit(req, res, next) {
  try {
    await authRateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
    
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Too Many Authentication Attempts',
      message: 'Too many failed authentication attempts. Please try again later.',
      retryAfter: retryAfter
    });
  }
}

// AI rate limiting middleware
async function aiRateLimit(req, res, next) {
  try {
    await aiRateLimiter.consume(req.user ? req.user.id : req.ip);
    next();
  } catch (rejRes) {
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
    
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'AI Rate Limit Exceeded',
      message: 'Too many AI requests. Please try again later.',
      retryAfter: retryAfter
    });
  }
}

// File upload rate limiting
const uploadRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
  points: 10, // 10 uploads
  duration: 60 * 60, // 1 hour
  blockDuration: 30 * 60, // 30 minutes block
});

async function uploadRateLimit(req, res, next) {
  try {
    await uploadRateLimiter.consume(req.user ? req.user.id : req.ip);
    next();
  } catch (rejRes) {
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
    
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Upload Rate Limit Exceeded',
      message: 'Too many file uploads. Please try again later.',
      retryAfter: retryAfter
    });
  }
}

module.exports = {
  setupRateLimiting,
  authRateLimit,
  aiRateLimit,
  uploadRateLimit
}; 