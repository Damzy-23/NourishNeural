const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Load .env from server directory (handles different working directories)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('📁 Loading .env from:', path.resolve(__dirname, '../.env'));

// Import mock database
const mockDB = require('./mockDatabase');

// Import Supabase client (used in profile endpoints)
const { supabase } = require('./config/supabase');

// Database and GraphQL setup (disabled for now - using Supabase)
// const { connectDB } = require('./config/database');
// const { setupGraphQL } = require('./config/graphql');
// const { setupPassport } = require('./config/passport');
// const { setupSession } = require('./config/session');
// const { setupRateLimiting } = require('./middleware/rateLimiter');

// Import routes
const supabaseAuthRoutes = require('./routes/supabase-auth');
const groceryRoutes = require('./routes/supabase-groceries');
const storeRoutes = require('./routes/stores');
const aiRoutes = require('./routes/ai');
const pantryRoutes = require('./routes/pantry');
const mlRoutes = require('./routes/ml');
const barcodeRoutes = require('./routes/barcode');
const loyaltyRoutes = require('./routes/loyalty');
const mealPlannerRoutes = require('./routes/meal-planner');
const wasteRoutes = require('./routes/waste');
const householdRoutes = require('./routes/households');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - temporarily disabled
// app.use(setupRateLimiting());

// Session setup - temporarily disabled
// setupSession(app);

// Passport setup - temporarily disabled
// setupPassport(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Mock dashboard endpoint
app.get('/api/dashboard', (req, res) => {
  res.json({
    stats: {
      groceryLists: { total: 5, active: 2, completed: 3, itemsCount: 24 },
      pantry: { totalItems: 45, totalValue: 125.50, expiringSoon: 8, lowStock: 3, categories: { 'Dairy': 8, 'Vegetables': 12, 'Meat': 6, 'Grains': 10, 'Snacks': 9 } },
      spending: { thisMonth: 180.75, lastMonth: 195.30, saved: 14.55, budget: 200, trend: 'down' },
      activity: {
        recentLists: [
          { id: 1, name: 'Weekly Shopping', items: 12, progress: 75, status: 'active', updatedAt: new Date().toISOString() },
          { id: 2, name: 'Dinner Party', items: 8, progress: 100, status: 'completed', updatedAt: new Date().toISOString() }
        ], recentPantryItems: [], completedTasks: 5
      }
    }
  });
});

// Mock recommendations endpoint
app.get('/api/dashboard/recommendations', (req, res) => {
  res.json({
    recommendations: [
      { id: 1, type: 'expiry', title: 'Milk expires tomorrow', description: 'Use your milk in a recipe or freeze it', action: 'View recipes', link: '/app/ai-assistant', priority: 'high' },
      { id: 2, type: 'recipe', title: 'Try pasta with tomatoes', description: 'You have all ingredients for this recipe', action: 'See recipe', link: '/app/ai-assistant', priority: 'medium' },
      { id: 3, type: 'shopping', title: 'Low on bread', description: 'Add bread to your shopping list', action: 'Add to list', link: '/app/grocery-lists', priority: 'low' }
    ]
  });
});

// Mock pantry endpoints - DISABLED: Real routes are now handled by pantryRoutes
// These mock routes were conflicting with the real Supabase-backed routes
// The real routes are mounted at: app.use('/api/pantry', pantryRoutes);
/*
app.get('/api/pantry', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Milk', quantity: 1, unit: 'litre', category: 'Dairy', expiryDate: '2024-01-15', estimatedPrice: 1.20, notes: 'Whole milk' },
      { id: 2, name: 'Bread', quantity: 2, unit: 'loaves', category: 'Grains', expiryDate: '2024-01-20', estimatedPrice: 1.50, notes: 'Whole wheat' },
      { id: 3, name: 'Tomatoes', quantity: 6, unit: 'pieces', category: 'Vegetables', expiryDate: '2024-01-18', estimatedPrice: 2.00, notes: 'Cherry tomatoes' },
      { id: 4, name: 'Chicken Breast', quantity: 500, unit: 'grams', category: 'Meat', expiryDate: '2024-01-16', estimatedPrice: 4.50, notes: 'Free range' },
      { id: 5, name: 'Pasta', quantity: 500, unit: 'grams', category: 'Grains', expiryDate: '2025-01-01', estimatedPrice: 1.80, notes: 'Spaghetti' }
    ]
  });
});

app.get('/api/pantry/stats', (req, res) => {
  res.json({
    stats: {
      totalItems: 45,
      totalValue: 125.50,
      expiringSoon: 8,
      lowStock: 3,
      categories: { 'Dairy': 8, 'Vegetables': 12, 'Meat': 6, 'Grains': 10, 'Snacks': 9 },
      averageItemValue: 2.79
    }
  });
});

app.get('/api/pantry/categories', (req, res) => {
  res.json({
    categories: ['Dairy', 'Vegetables', 'Meat', 'Grains', 'Snacks', 'Beverages', 'Frozen', 'Condiments']
  });
});
*/

// Grocery lists are handled by the Supabase-backed route below


// API routes - Use Supabase auth routes
app.use('/api/auth', supabaseAuthRoutes);
// app.use('/api/users', userRoutes);

// Mock endpoints must be defined before route handlers to take precedence
// User profile endpoints
app.get('/api/users/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'Valid token required to access profile'
      });
    }

    const token = authHeader.substring(7);
    const session = mockDB.getSession(token);

    if (!session) {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token is invalid or expired'
      });
    }

    const user = mockDB.getUserById(session.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: 'User profile not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      profile: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
});

app.put('/api/users/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'Valid token required to update profile'
      });
    }

    const token = authHeader.substring(7);

    // Use Supabase to verify token and get user
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        details: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file'
      });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token is invalid or expired'
      });
    }

    // Parse name into firstName and lastName if provided
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;

    if (req.body.name && !req.body.firstName && !req.body.lastName) {
      const nameParts = req.body.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Update user profile in Supabase
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        first_name: firstName || user.user_metadata?.first_name,
        last_name: lastName || user.user_metadata?.last_name,
        email: req.body.email || user.email,
        age: req.body.age !== undefined ? req.body.age : null,
        phone: req.body.phone !== undefined ? req.body.phone : null,
        address: req.body.address !== undefined ? req.body.address : null,
        city: req.body.city !== undefined ? req.body.city : null,
        postal_code: req.body.postalCode !== undefined ? req.body.postalCode : null,
        country: req.body.country !== undefined ? req.body.country : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();

    if (updateError) {
      console.error('Supabase profile update error:', updateError);
      return res.status(500).json({
        error: 'Failed to update profile',
        details: updateError.message
      });
    }

    // Also update user metadata in Supabase Auth
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        first_name: firstName || user.user_metadata?.first_name,
        last_name: lastName || user.user_metadata?.last_name,
        age: req.body.age !== undefined ? req.body.age : user.user_metadata?.age
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: req.body.email || user.email,
        firstName: updatedProfile?.first_name || firstName,
        lastName: updatedProfile?.last_name || lastName,
        age: updatedProfile?.age || req.body.age,
        phone: updatedProfile?.phone || req.body.phone,
        address: updatedProfile?.address || req.body.address,
        city: updatedProfile?.city || req.body.city,
        postalCode: updatedProfile?.postal_code || req.body.postalCode,
        country: updatedProfile?.country || req.body.country,
        avatarUrl: updatedProfile?.avatar_url || null,
        isVerified: user.email_confirmed_at != null,
        role: user.role || 'user',
        createdAt: user.created_at,
        updatedAt: updatedProfile?.updated_at || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message
    });
  }
});

// Mock user preferences endpoint
app.get('/api/users/preferences', (req, res) => {
  res.json({
    preferences: {
      id: '1',
      userId: '1',
      dietaryRestrictions: ['Vegetarian'],
      allergies: ['Peanuts'],
      cuisinePreferences: ['Italian', 'Indian'],
      budgetLimit: 200,
      householdSize: 4,
      shoppingFrequency: 'Weekly',
      preferredStores: ['Tesco', 'Sainsbury\'s'],
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        expiryReminders: true,
        shoppingReminders: true,
        dealAlerts: false
      },
      privacySettings: {
        shareDataWithPartners: false,
        allowAnalytics: true,
        publicProfile: false
      }
    }
  });
});

// Mock update user preferences endpoint
app.put('/api/users/preferences', (req, res) => {
  const { preferences } = req.body;
  res.json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: {
      dietaryRestrictions: preferences.dietaryRestrictions || ['Vegetarian'],
      budgetLimit: preferences.budgetLimit || 200,
      householdSize: preferences.householdSize || 4,
      preferredStores: preferences.preferredStores || ['Tesco', 'Sainsbury\'s'],
      notifications: preferences.notifications || {
        expiryAlerts: true,
        lowStockAlerts: true,
        recipeSuggestions: true,
        weeklyReports: false
      },
      theme: preferences.theme || 'light',
      language: preferences.language || 'en',
      timezone: preferences.timezone || 'Europe/London'
    }
  });
});

// Authentication endpoints (DISABLED - Using Supabase routes instead)
/* app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !age) {
      return res.status(400).json({
        error: 'All fields are required',
        details: 'firstName, lastName, email, age, and password are required'
      });
    }

    // Check if email already exists
    if (!mockDB.isEmailUnique(email)) {
      return res.status(409).json({
        error: 'Email already exists',
        details: 'An account with this email address already exists'
      });
    }

    // Create new user (now async - password will be hashed)
    const newUser = await mockDB.createUser({ firstName, lastName, email, password, age });

    // Create session
    const token = mockDB.generateToken();
    mockDB.createSession(newUser.id, token);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Authenticate user (now async - password will be compared with bcrypt)
    const user = await mockDB.authenticateUser(email, password);

    // Create session
    const token = mockDB.generateToken();
    mockDB.createSession(user.id, token);

    // Update last login (now async due to potential password hashing)
    await mockDB.updateUser(email, { lastLoginAt: new Date().toISOString() });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        details: 'Authorization header with Bearer token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Use Supabase to verify token and get user
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase not configured',
        details: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file'
      });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token is invalid or expired'
      });
    }

    // Get user profile from Supabase
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || user.user_metadata?.first_name || '',
      lastName: profile?.last_name || user.user_metadata?.last_name || '',
      age: profile?.age || user.user_metadata?.age || null,
      phone: profile?.phone || null,
      address: profile?.address || null,
      city: profile?.city || null,
      postalCode: profile?.postal_code || null,
      country: profile?.country || null,
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

app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      mockDB.deleteSession(token);
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: error.message
    });
  }
}); */

// Mock user stats endpoint
app.get('/api/users/stats', (req, res) => {
  res.json({
    stats: {
      totalSavings: 125.50,
      wasteReduction: 35,
      daysActive: 45,
      recipesTried: 12,
      itemsTracked: 89,
      listsCompleted: 23,
      avgWeeklySpend: 45.30,
      favoriteCategories: ['Vegetables', 'Dairy', 'Meat'],
      monthlyTrend: {
        savings: [10.50, 15.20, 12.80, 18.90, 22.10, 25.50],
        waste: [8, 6, 4, 3, 2, 1],
        spending: [180, 165, 155, 145, 140, 135]
      }
    }
  });
});

// Mock update user profile endpoint
app.put('/api/users/profile', (req, res) => {
  const { name, email, avatar } = req.body;
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: '1',
      name: name || 'John Doe',
      email: email || 'john.doe@example.com',
      avatar: avatar || 'https://ui-avatars.com/api/?name=John+Doe&background=random',
      updatedAt: new Date().toISOString()
    }
  });
});


app.use('/api/groceries', groceryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/meal-planner', mealPlannerRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/households', householdRoutes);

// GraphQL setup (disabled - using Supabase)
// setupGraphQL(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database - temporarily disabled
    // await connectDB();
    // console.log('✅ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Nourish Neural server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔑 Using Supabase Auth: ${process.env.SUPABASE_URL ? '✅' : '❌'}`);
      console.log(`🎯 CORS enabled for: ${process.env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer(); 
