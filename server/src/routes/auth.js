const express = require('express');
const passport = require('passport');
const { authenticateJWT, generateToken } = require('../config/passport');
const { authRateLimit } = require('../middleware/rateLimiter');

const router = express.Router();

// Google OAuth routes
router.get('/google',
  authRateLimit,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('pantrypal.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current user session
router.get('/me', authenticateJWT, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      avatarUrl: req.user.avatar_url,
      isVerified: req.user.is_verified,
      role: req.user.role,
      createdAt: req.user.created_at,
      updatedAt: req.user.updated_at
    }
  });
});

// Refresh token
router.post('/refresh', authenticateJWT, (req, res) => {
  try {
    const newToken = generateToken(req.user);
    res.json({
      token: newToken,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        avatarUrl: req.user.avatar_url,
        isVerified: req.user.is_verified,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Check if user is authenticated
router.get('/check', authenticateJWT, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

module.exports = router; 