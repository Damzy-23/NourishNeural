const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Load .env from server directory (handles different working directories)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('📁 Loading .env from:', path.resolve(__dirname, '../.env'));

// Import Supabase client
const { supabase } = require('./config/supabase');
const { authenticateJWT } = require('./middleware/supabaseAuth');

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// ─── Helper: extract user from Bearer token (no 401 on failure) ───
async function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || !supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(authHeader.substring(7));
  return user || null;
}

// ─── Dashboard stats — real Supabase aggregation ───
app.get('/api/dashboard', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const userId = user?.id;

    // Pantry stats
    let pantryStats = { totalItems: 0, totalValue: 0, expiringSoon: 0, lowStock: 0, categories: {} };
    if (userId) {
      const { data: pantryItems } = await supabase
        .from('pantry_items')
        .select('name, category, quantity, unit, estimated_price, expiry_date')
        .eq('user_id', userId)
        .eq('is_archived', false);

      if (pantryItems) {
        const now = new Date();
        pantryStats.totalItems = pantryItems.length;
        pantryStats.totalValue = pantryItems.reduce((sum, i) => sum + (parseFloat(i.estimated_price) || 0), 0);
        pantryStats.expiringSoon = pantryItems.filter(i => {
          if (!i.expiry_date) return false;
          const days = (new Date(i.expiry_date) - now) / 86400000;
          return days >= 0 && days <= 3;
        }).length;
        pantryStats.lowStock = pantryItems.filter(i => (i.quantity || 0) <= 1).length;

        // Category breakdown
        pantryItems.forEach(i => {
          const cat = i.category || 'Other';
          pantryStats.categories[cat] = (pantryStats.categories[cat] || 0) + 1;
        });
      }
    }

    // Grocery list stats
    let groceryStats = { total: 0, active: 0, completed: 0, itemsCount: 0 };
    if (userId) {
      const { data: lists } = await supabase
        .from('grocery_lists')
        .select('id, status, items')
        .eq('user_id', userId);

      if (lists) {
        groceryStats.total = lists.length;
        groceryStats.active = lists.filter(l => l.status !== 'completed').length;
        groceryStats.completed = lists.filter(l => l.status === 'completed').length;
        groceryStats.itemsCount = lists.reduce((sum, l) => {
          const items = Array.isArray(l.items) ? l.items : [];
          return sum + items.length;
        }, 0);
      }
    }

    // Recent activity
    let recentLists = [];
    if (userId) {
      const { data: recent } = await supabase
        .from('grocery_lists')
        .select('id, name, items, status, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (recent) {
        recentLists = recent.map(l => {
          const items = Array.isArray(l.items) ? l.items : [];
          const checked = items.filter(i => i.checked).length;
          return {
            id: l.id,
            name: l.name,
            items: items.length,
            progress: items.length > 0 ? Math.round((checked / items.length) * 100) : 0,
            status: l.status || 'active',
            updatedAt: l.updated_at
          };
        });
      }
    }

    // Spending estimate (sum of pantry item prices added this month)
    let spending = { thisMonth: 0, lastMonth: 0, saved: 0, budget: 200, trend: 'stable' };
    if (userId) {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const { data: thisMonthItems } = await supabase
        .from('pantry_items')
        .select('estimated_price')
        .eq('user_id', userId)
        .gte('created_at', thisMonthStart);

      const { data: lastMonthItems } = await supabase
        .from('pantry_items')
        .select('estimated_price')
        .eq('user_id', userId)
        .gte('created_at', lastMonthStart)
        .lt('created_at', thisMonthStart);

      spending.thisMonth = (thisMonthItems || []).reduce((s, i) => s + (parseFloat(i.estimated_price) || 0), 0);
      spending.lastMonth = (lastMonthItems || []).reduce((s, i) => s + (parseFloat(i.estimated_price) || 0), 0);
      spending.saved = Math.max(0, spending.lastMonth - spending.thisMonth);
      spending.trend = spending.thisMonth < spending.lastMonth ? 'down' : spending.thisMonth > spending.lastMonth ? 'up' : 'stable';
    }

    res.json({
      stats: {
        groceryLists: groceryStats,
        pantry: pantryStats,
        spending,
        activity: {
          recentLists,
          recentPantryItems: [],
          completedTasks: groceryStats.completed
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
  }
});

// ─── Dashboard recommendations — dynamic from pantry data ───
app.get('/api/dashboard/recommendations', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const recommendations = [];

    if (user?.id) {
      const now = new Date();

      // Items expiring within 2 days
      const twoDaysOut = new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0];
      const { data: expiring } = await supabase
        .from('pantry_items')
        .select('name, expiry_date')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .lte('expiry_date', twoDaysOut)
        .gte('expiry_date', now.toISOString().split('T')[0])
        .order('expiry_date')
        .limit(3);

      if (expiring?.length) {
        expiring.forEach((item, i) => {
          const daysLeft = Math.ceil((new Date(item.expiry_date) - now) / 86400000);
          recommendations.push({
            id: `exp-${i}`,
            type: 'expiry',
            title: daysLeft === 0 ? `${item.name} expires today` : `${item.name} expires ${daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}`,
            description: `Use it up or freeze it to avoid waste`,
            action: 'Find recipes',
            link: '/app/ai-assistant',
            priority: daysLeft === 0 ? 'high' : 'medium'
          });
        });
      }

      // Low stock items (quantity <= 1)
      const { data: lowStock } = await supabase
        .from('pantry_items')
        .select('name')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .lte('quantity', 1)
        .limit(2);

      if (lowStock?.length) {
        recommendations.push({
          id: 'low-1',
          type: 'shopping',
          title: `Running low on ${lowStock.map(i => i.name).join(' and ')}`,
          description: 'Add to your shopping list before you run out',
          action: 'Add to list',
          link: '/app/grocery-lists',
          priority: 'low'
        });
      }

      // If no recommendations, add a helpful default
      if (recommendations.length === 0) {
        recommendations.push({
          id: 'tip-1',
          type: 'recipe',
          title: 'Ask Nurexa for recipe ideas',
          description: 'Get personalised suggestions based on what you have',
          action: 'Chat now',
          link: '/app/ai-assistant',
          priority: 'low'
        });
      }
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.json({ recommendations: [] });
  }
});

// ─── User profile — Supabase-backed ───
app.get('/api/users/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      profile: {
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
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

app.put('/api/users/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;

    if (req.body.name && !req.body.firstName && !req.body.lastName) {
      const nameParts = req.body.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

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
      return res.status(500).json({ error: 'Failed to update profile', details: updateError.message });
    }

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
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// ─── User preferences — Supabase-backed ───
const DEFAULT_PREFS = {
  dietaryRestrictions: [],
  allergies: [],
  cuisinePreferences: [],
  budgetLimit: 200,
  householdSize: 1,
  shoppingFrequency: 'Weekly',
  preferredStores: [],
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
};

app.get('/api/users/preferences', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!prefs) {
      // No preferences row yet — return defaults
      return res.json({ preferences: { ...DEFAULT_PREFS, id: null, userId } });
    }

    res.json({
      preferences: {
        id: prefs.id,
        userId: prefs.user_id,
        dietaryRestrictions: prefs.dietary_restrictions || [],
        allergies: prefs.allergies || [],
        cuisinePreferences: prefs.cuisine_preferences || [],
        budgetLimit: prefs.budget_weekly ? parseFloat(prefs.budget_weekly) : 200,
        householdSize: prefs.household_size || 1,
        shoppingFrequency: prefs.shopping_frequency || 'Weekly',
        preferredStores: prefs.preferred_stores || [],
        notificationSettings: {
          emailNotifications: prefs.notification_settings?.emailNotifications ?? true,
          pushNotifications: prefs.notification_settings?.pushNotifications ?? true,
          expiryReminders: prefs.notification_settings?.expiryReminders ?? true,
          shoppingReminders: prefs.notification_settings?.shoppingReminders ?? true,
          dealAlerts: prefs.notification_settings?.dealAlerts ?? false
        },
        privacySettings: {
          shareDataWithPartners: prefs.privacy_settings?.shareDataWithPartners ?? false,
          allowAnalytics: prefs.privacy_settings?.allowAnalytics ?? true,
          publicProfile: prefs.privacy_settings?.publicProfile ?? false
        }
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences', details: error.message });
  }
});

app.put('/api/users/preferences', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const p = req.body;

    const row = {
      user_id: userId,
      dietary_restrictions: p.dietaryRestrictions || [],
      allergies: p.allergies || [],
      cuisine_preferences: p.cuisinePreferences || [],
      budget_weekly: p.budgetLimit || null,
      household_size: p.householdSize || 1,
      shopping_frequency: p.shoppingFrequency || 'Weekly',
      preferred_stores: p.preferredStores || [],
      notification_settings: p.notificationSettings || DEFAULT_PREFS.notificationSettings,
      privacy_settings: p.privacySettings || DEFAULT_PREFS.privacySettings,
      updated_at: new Date().toISOString()
    };

    const { data: upserted, error } = await supabase
      .from('user_preferences')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Update preferences error:', error);
      return res.status(500).json({ error: 'Failed to update preferences', details: error.message });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        id: upserted.id,
        userId: upserted.user_id,
        dietaryRestrictions: upserted.dietary_restrictions || [],
        allergies: upserted.allergies || [],
        cuisinePreferences: upserted.cuisine_preferences || [],
        budgetLimit: upserted.budget_weekly ? parseFloat(upserted.budget_weekly) : 200,
        householdSize: upserted.household_size || 1,
        shoppingFrequency: upserted.shopping_frequency || 'Weekly',
        preferredStores: upserted.preferred_stores || [],
        notificationSettings: upserted.notification_settings || DEFAULT_PREFS.notificationSettings,
        privacySettings: upserted.privacy_settings || DEFAULT_PREFS.privacySettings
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences', details: error.message });
  }
});

// ─── User stats — real aggregation from Supabase ───
app.get('/api/users/stats', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Pantry items tracked
    const { count: itemsTracked } = await supabase
      .from('pantry_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Grocery lists completed
    const { count: listsCompleted } = await supabase
      .from('grocery_lists')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Total grocery lists
    const { count: totalLists } = await supabase
      .from('grocery_lists')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Waste logs — total wasted value
    const { data: wasteLogs } = await supabase
      .from('waste_logs')
      .select('estimated_cost, created_at')
      .eq('user_id', userId);

    const totalWasteCost = (wasteLogs || []).reduce((s, w) => s + (parseFloat(w.estimated_cost) || 0), 0);
    const wasteCount = (wasteLogs || []).length;

    // Spending — sum of pantry item prices
    const { data: allItems } = await supabase
      .from('pantry_items')
      .select('estimated_price, created_at')
      .eq('user_id', userId);

    const totalSpent = (allItems || []).reduce((s, i) => s + (parseFloat(i.estimated_price) || 0), 0);
    const totalSavings = Math.max(0, totalSpent * 0.15 - totalWasteCost); // estimate: 15% saved by tracking

    // Days active (since account creation)
    const createdAt = req.user.created_at || now.toISOString();
    const daysActive = Math.max(1, Math.ceil((now - new Date(createdAt)) / 86400000));

    // Monthly spending trend (last 6 months)
    const monthlySpending = [];
    const monthlyWaste = [];
    for (let m = 5; m >= 0; m--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
      const monthItems = (allItems || []).filter(i => {
        const d = new Date(i.created_at);
        return d >= monthStart && d < monthEnd;
      });
      monthlySpending.push(monthItems.reduce((s, i) => s + (parseFloat(i.estimated_price) || 0), 0));

      const monthWaste = (wasteLogs || []).filter(w => {
        const d = new Date(w.created_at);
        return d >= monthStart && d < monthEnd;
      });
      monthlyWaste.push(monthWaste.length);
    }

    res.json({
      stats: {
        totalSavings: Math.round(totalSavings * 100) / 100,
        wasteReduction: wasteCount > 0 ? Math.round(Math.max(0, 100 - (totalWasteCost / Math.max(totalSpent, 1)) * 100)) : 0,
        daysActive,
        recipesTried: 0, // no recipe tracking table yet
        itemsTracked: itemsTracked || 0,
        listsCompleted: listsCompleted || 0,
        totalLists: totalLists || 0,
        avgWeeklySpend: daysActive >= 7 ? Math.round((totalSpent / (daysActive / 7)) * 100) / 100 : totalSpent,
        favoriteCategories: [],
        monthlyTrend: {
          savings: monthlySpending.map((s, i) => Math.max(0, Math.round((s * 0.15 - (monthlyWaste[i] * 2)) * 100) / 100)),
          waste: monthlyWaste,
          spending: monthlySpending.map(s => Math.round(s * 100) / 100)
        }
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// API routes
app.use('/api/auth', supabaseAuthRoutes);
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
