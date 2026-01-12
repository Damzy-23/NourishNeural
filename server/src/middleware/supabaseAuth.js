const { supabase } = require('../config/supabase');

/**
 * Middleware to authenticate requests using Supabase JWT tokens
 * Extracts the token from Authorization header and verifies it with Supabase
 * Attaches the authenticated user to req.user
 */
async function authenticateJWT(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    console.log('🔐 Auth middleware - Path:', req.path)
    console.log('🔐 Auth middleware - Has Auth Header:', !!authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔐 Auth middleware - No Bearer token provided')
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'No authentication token provided. Please include a Bearer token in the Authorization header.'
      });
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error('🔐 Auth middleware - Supabase client not configured!')
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Authentication service is not properly configured'
      });
    }

    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    console.log('🔐 Auth middleware - Token length:', token.length)

    // Verify the token with Supabase
    console.log('🔐 Auth middleware - Verifying token with Supabase...')
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('🔐 Auth middleware - Token verification error:', error.message)
      return res.status(401).json({
        error: 'Invalid token',
        details: 'The provided authentication token is invalid or expired'
      });
    }

    if (!user) {
      console.log('🔐 Auth middleware - No user found for token')
      return res.status(401).json({
        error: 'User not found',
        details: 'No user associated with the provided token'
      });
    }

    console.log('🔐 Auth middleware - User authenticated:', user.id)

    // Attach user to request object for use in route handlers
    req.user = user;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('🔐 Auth middleware - Unexpected error:', error.message)
    console.error(error.stack)
    return res.status(500).json({
      error: 'Authentication failed',
      details: error.message || 'An error occurred during authentication'
    });
  }
}

/**
 * Optional authentication middleware
 * Continues even if no token is provided, but verifies if one exists
 * Useful for routes that work differently for authenticated users
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    if (!supabase) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // Set user if valid, otherwise null
    req.user = (error || !user) ? null : user;

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
}

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateJWT
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Authentication required'
    });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin' && req.user.app_metadata?.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      details: 'Admin access required'
    });
  }

  next();
}

/**
 * Middleware to extract user ID and attach to request
 * Useful for routes that need just the user ID
 */
function getUserId(req, res, next) {
  if (req.user && req.user.id) {
    req.userId = req.user.id;
  }
  next();
}

module.exports = {
  authenticateJWT,
  optionalAuth,
  requireAdmin,
  getUserId
};
