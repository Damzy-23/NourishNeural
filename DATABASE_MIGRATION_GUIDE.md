# Database Migration Guide - Moving to Supabase

## Current Situation

Your Nourish Neural application currently has:
- ✅ **Auth**: Migrated to Supabase Auth (working)
- ❌ **Pantry**: Using mock data in frontend, broken Knex backend
- ❌ **Grocery Lists**: Using mock data in frontend, no backend
- ❌ **Other Features**: Using mock data

## Migration Steps

### Step 1: Create Supabase Tables (REQUIRED)

1. Go to your Supabase Dashboard
   - URL: https://supabase.com/dashboard/project/plbgshkuzoxvudrxxpny

2. Navigate to **SQL Editor**

3. Copy the entire content of `SUPABASE_SCHEMA.sql` and paste it into the SQL Editor

4. Click **Run** to execute the schema

5. Verify tables were created:
   - Go to **Table Editor**
   - You should see:
     - `user_profiles`
     - `user_preferences`
     - `pantry_items`
     - `grocery_lists`
     - `grocery_list_items`
     - `recipes`
     - `meal_plans`
     - `ai_interactions`
     - `stores`

### Step 2: Update Backend Routes

The backend routes need to be updated to use Supabase instead of Knex. Here's what needs to be changed:

#### Files to Update:
1. `server/src/routes/pantry.js` - Replace Knex with Supabase
2. `server/src/routes/groceries.js` - Replace Knex with Supabase
3. `server/src/routes/users.js` - Replace Knex with Supabase
4. Create `server/src/middleware/supabaseAuth.js` - Auth middleware

### Step 3: Create Supabase Auth Middleware

This middleware will:
- Extract JWT token from Authorization header
- Verify token with Supabase
- Attach user info to `req.user`
- Replace the dummy middleware currently in pantry.js and ai.js

### Step 4: Update Frontend API Calls

The frontend components need to:
- Remove mock data
- Call real API endpoints
- Handle loading states
- Handle errors properly

### Step 5: Test Each Feature

Test in this order:
1. ✅ Authentication (already working)
2. Pantry Items
3. Grocery Lists
4. Dashboard (depends on Pantry + Lists)
5. AI Assistant
6. Stores
7. Profile

## What's Already Been Created

### Database Schema (SUPABASE_SCHEMA.sql)

Comprehensive schema including:
- **user_profiles**: Extended user data (first_name, last_name, avatar, etc.)
- **user_preferences**: Dietary restrictions, allergies, budget, etc.
- **pantry_items**: Complete pantry management with expiry tracking
- **grocery_lists** + **grocery_list_items**: Shopping list management
- **recipes**: Recipe storage with ingredients and instructions
- **meal_plans**: Weekly meal planning
- **ai_interactions**: AI assistant usage logging
- **stores**: UK supermarket locations (pre-populated with sample data)

### Security Features

All tables have:
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Policies** ensuring users only see their own data
- ✅ **Indexes** for performance
- ✅ **Timestamps** (created_at, updated_at)
- ✅ **Triggers** to auto-update timestamps

### Sample Data

- 5 UK stores pre-populated (Tesco, Sainsbury's, Asda, Morrisons, Waitrose)
- Ready for testing immediately after schema creation

## Quick Start Implementation

### Priority 1: Get Pantry Working

1. **Create the tables** (Step 1 above)

2. **Create auth middleware**:
   ```javascript
   // server/src/middleware/supabaseAuth.js
   const { supabase } = require('../config/supabase');

   async function authenticateJWT(req, res, next) {
     try {
       const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({ error: 'No token provided' });
       }

       const token = authHeader.substring(7);
       const { data: { user }, error } = await supabase.auth.getUser(token);

       if (error || !user) {
         return res.status(401).json({ error: 'Invalid token' });
       }

       req.user = user;
       next();
     } catch (error) {
       res.status(500).json({ error: 'Authentication failed' });
     }
   }

   module.exports = { authenticateJWT };
   ```

3. **Update pantry routes** to use Supabase instead of Knex

4. **Update Pantry.tsx** to call real API instead of using mock data

## Benefits of This Migration

### 1. Real-Time Capabilities
- Supabase provides real-time subscriptions
- Pantry items can update live across devices
- Grocery lists can be collaborative

### 2. Scalability
- No more in-memory mock data
- Proper database with indexes
- Handles thousands of items

### 3. Security
- Row Level Security prevents data leaks
- Each user only sees their own data
- SQL injection protection

### 4. Rich Features
- Full-text search on pantry items
- Complex queries (expiring items, low stock)
- Aggregations (total value, category breakdown)

### 5. Easy Deployment
- No database server to manage
- Supabase handles backups
- Built-in API

## Database Schema Highlights

### Pantry Items
```sql
- Tracks quantity, unit, category
- Expiry date management
- Purchase tracking
- Price estimation
- Barcode support
- Archive functionality
- Image support
```

### Grocery Lists
```sql
- Multiple lists per user
- Items with quantities
- Price tracking (estimated vs actual)
- Completion status
- Priority levels
- Store preferences
```

### Smart Features Built-In

1. **Expiring Soon View**
   - Automatically shows items expiring in 7 days
   - Sorted by expiry date

2. **Pantry Stats View**
   - Total items count
   - Total value
   - Expiring soon count
   - Low stock count
   - Category diversity

3. **Category Management**
   - Flexible categorization
   - Easy filtering

## Testing the Migration

### Test Pantry Items

1. **Create an item**:
   ```bash
   POST /api/pantry
   {
     "name": "Milk",
     "quantity": 2,
     "unit": "bottles",
     "category": "Dairy",
     "expiryDate": "2025-01-25",
     "estimatedPrice": 2.50
   }
   ```

2. **Get all items**:
   ```bash
   GET /api/pantry
   ```

3. **Filter by expiring soon**:
   ```bash
   GET /api/pantry?expiringSoon=true
   ```

4. **Update an item**:
   ```bash
   PUT /api/pantry/:id
   {
     "quantity": 1
   }
   ```

5. **Delete an item**:
   ```bash
   DELETE /api/pantry/:id
   ```

## Network Connectivity Issue

I noticed in the server logs that there's a DNS resolution error:
```
Error: getaddrinfo ENOTFOUND plbgshkuzoxvudrxxpny.supabase.co
```

This could be:
1. **Temporary network issue** - Try restarting your computer/router
2. **DNS cache** - Clear DNS cache: `ipconfig /flushdns` (Windows)
3. **Firewall/Antivirus** - Check if blocking Supabase
4. **ISP issue** - Try mobile hotspot to test

Once network connectivity is restored, everything should work!

## Next Steps After Tables Are Created

1. I'll create the Supabase auth middleware
2. Update pantry backend routes
3. Update pantry frontend component
4. Test the full flow
5. Repeat for grocery lists
6. Update dashboard to show real data

## Rollback Plan

If something goes wrong:
1. Tables can be dropped from Supabase SQL Editor
2. Frontend mock data still exists as fallback
3. No data loss (mock data is in code)
4. Can re-run schema script anytime

## Estimated Time

- Create tables: 2 minutes
- Create auth middleware: 5 minutes
- Update pantry backend: 15 minutes
- Update pantry frontend: 10 minutes
- Testing: 10 minutes
- **Total: ~45 minutes for full pantry feature**

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for errors
3. Check server terminal for API errors
4. Verify RLS policies are correct
5. Test authentication with Postman/Thunder Client
