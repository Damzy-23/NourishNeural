const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !age) {
      return res.status(400).json({
        error: 'All fields are required',
        details: 'firstName, lastName, email, age, and password are required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        details: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file'
      });
    }

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age)
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);

      if (authError.message.includes('already registered')) {
        return res.status(409).json({
          error: 'Email already exists',
          details: 'An account with this email address already exists'
        });
      }

      return res.status(400).json({
        error: 'Registration failed',
        details: authError.message
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        error: 'Registration failed',
        details: 'User creation failed'
      });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        age: parseInt(age)
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the whole registration if profile creation fails
      // The trigger should have created it, but we're trying to be safe
    }

    // Create default user preferences
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: authData.user.id
      });

    if (prefsError) {
      console.error('Preferences creation error:', prefsError);
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Return user data and session
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: profile?.first_name || firstName,
        lastName: profile?.last_name || lastName,
        age: profile?.age || age,
        avatarUrl: profile?.avatar_url || null,
        isVerified: authData.user.email_confirmed_at != null,
        role: authData.user.role || 'user',
        createdAt: authData.user.created_at,
        updatedAt: profile?.updated_at || authData.user.created_at
      },
      token: authData.session?.access_token,
      session: authData.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        details: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file'
      });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Invalid email or password'
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'User not found'
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Return user data and session
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: profile?.first_name || authData.user.user_metadata?.first_name,
        lastName: profile?.last_name || authData.user.user_metadata?.last_name,
        age: profile?.age || authData.user.user_metadata?.age,
        avatarUrl: profile?.avatar_url || null,
        isVerified: authData.user.email_confirmed_at != null,
        role: authData.user.role || 'user',
        createdAt: authData.user.created_at,
        updatedAt: profile?.updated_at || authData.user.updated_at
      },
      token: authData.session.access_token,
      session: authData.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
});

// Get current user (verify token)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        details: 'Authorization header with Bearer token is required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured'
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token is invalid or expired'
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Return user data
    res.json({
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || user.user_metadata?.first_name,
      lastName: profile?.last_name || user.user_metadata?.last_name,
      age: profile?.age || user.user_metadata?.age,
      avatarUrl: profile?.avatar_url || null,
      isVerified: user.email_confirmed_at != null,
      role: user.role || 'user',
      createdAt: user.created_at,
      updatedAt: profile?.updated_at || user.updated_at
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      error: 'Authentication check failed',
      details: error.message
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ') && supabase) {
      const token = authHeader.substring(7);
      // Sign out from Supabase
      await supabase.auth.signOut(token);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Still return success even if logout fails
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        error: 'Token refresh failed',
        details: error.message
      });
    }

    res.json({
      success: true,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      session: data.session
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      details: error.message
    });
  }
});

// Forgot password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured'
      });
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Don't reveal error details for security
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  }
});

// Reset password - Update password with reset token
router.post('/reset-password', async (req, res) => {
  try {
    const { password } = req.body;
    const authHeader = req.headers.authorization;

    if (!password) {
      return res.status(400).json({
        error: 'New password is required'
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Reset token required',
        details: 'Authorization header with Bearer token is required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured'
      });
    }

    const token = authHeader.substring(7);

    // Verify the token is valid
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token);

    if (verifyError || !user) {
      return res.status(401).json({
        error: 'Invalid or expired reset token',
        details: 'Please request a new password reset link'
      });
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(400).json({
        error: 'Password reset failed',
        details: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      details: error.message
    });
  }
});

module.exports = router;
