const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import mock database
const mockDB = require('./mockDatabase');

// Database and GraphQL setup (disabled for now - using Supabase)
// const { connectDB } = require('./config/database');
// const { setupGraphQL } = require('./config/graphql');
// const { setupPassport } = require('./config/passport');
// const { setupSession } = require('./config/session');
// const { setupRateLimiting } = require('./middleware/rateLimiter');

// Import routes
const supabaseAuthRoutes = require('./routes/supabase-auth');
// Old routes disabled - they use Passport which is not configured
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const groceryRoutes = require('./routes/groceries');
const storeRoutes = require('./routes/stores');
const aiRoutes = require('./routes/ai');
const pantryRoutes = require('./routes/pantry');
const mlRoutes = require('./routes/ml');

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
      activity: { recentLists: [
        { id: 1, name: 'Weekly Shopping', items: 12, progress: 75, status: 'active', updatedAt: new Date().toISOString() },
        { id: 2, name: 'Dinner Party', items: 8, progress: 100, status: 'completed', updatedAt: new Date().toISOString() }
      ], recentPantryItems: [], completedTasks: 5 }
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

// Mock pantry endpoints
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

// Mock grocery lists endpoints
app.get('/api/groceries', (req, res) => {
  res.json({
    lists: [
      { id: 1, name: 'Weekly Shopping', status: 'active', items: [
        { id: 1, name: 'Milk', quantity: 2, unit: 'litres', category: 'Dairy', isChecked: false, estimatedPrice: 2.40 },
        { id: 2, name: 'Bread', quantity: 1, unit: 'loaf', category: 'Grains', isChecked: true, estimatedPrice: 1.50 },
        { id: 3, name: 'Apples', quantity: 6, unit: 'pieces', category: 'Fruits', isChecked: false, estimatedPrice: 3.00 }
      ], totalEstimatedCost: 6.90, createdAt: new Date().toISOString() },
      { id: 2, name: 'Dinner Party', status: 'completed', items: [
        { id: 4, name: 'Wine', quantity: 2, unit: 'bottles', category: 'Beverages', isChecked: true, estimatedPrice: 12.00 },
        { id: 5, name: 'Cheese', quantity: 200, unit: 'grams', category: 'Dairy', isChecked: true, estimatedPrice: 4.00 }
      ], totalEstimatedCost: 16.00, createdAt: new Date().toISOString() }
    ]
  });
});


// Mock AI chat endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    response: `I understand you're asking about "${message}". As your AI food assistant, I can help you with recipe suggestions, nutrition advice, and grocery shopping tips. How can I assist you further?`,
    suggestions: ['Find recipes', 'Check nutrition', 'Shopping tips', 'Food substitutions']
  });
});

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

    // Update user data (now async - password will be hashed if provided)
    const updatedUser = await mockDB.updateUser(user.email, {
      firstName: req.body.firstName || user.firstName,
      lastName: req.body.lastName || user.lastName,
      age: req.body.age || user.age,
      phone: req.body.phone || user.phone,
      address: req.body.address || user.address,
      city: req.body.city || user.city,
      postalCode: req.body.postalCode || user.postalCode,
      country: req.body.country || user.country
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
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

app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        details: 'Authorization header with Bearer token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const session = mockDB.getSession(token);
    
    if (!session) {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token is invalid or expired'
      });
    }

    const user = mockDB.getUserById(session.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        details: 'User associated with token no longer exists'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
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

// Mock grocery list operations
app.post('/api/groceries', (req, res) => {
  const { name, items } = req.body;
  res.json({
    success: true,
    message: 'Grocery list created successfully',
    list: {
      id: Date.now().toString(),
      name: name || 'New Grocery List',
      items: items || [],
      status: 'active',
      totalEstimatedCost: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/groceries/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `Grocery list ${id} deleted successfully`
  });
});

// app.use('/api/groceries', groceryRoutes); // Disabled - uses Passport
app.use('/api/stores', storeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/ml', mlRoutes);

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