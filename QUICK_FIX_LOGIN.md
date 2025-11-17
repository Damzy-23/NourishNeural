# Quick Fix - Login Not Working

## The Real Problem

Based on your error, here's what's happening:

1. ✅ **Registration works** - Users are created in Supabase Auth
2. ❌ **Login fails** - Can't retrieve user data
3. ❌ **Can't delete users** - "Database error deleting user"

## Root Cause

The **database tables don't exist yet**! Specifically, the `user_profiles` table.

When you register:
- ✅ User created in Supabase Auth (works)
- ❌ Profile creation fails silently (table doesn't exist)

When you login:
- ✅ Authentication succeeds (credentials valid)
- ❌ Fetching profile fails (table doesn't exist)
- ❌ Login appears to fail

When you delete:
- ❌ Can't delete because foreign key constraints expect tables to exist

## The Solution - Create Database Tables NOW

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/plbgshkuzoxvudrxxpny

### Step 2: Go to SQL Editor
Click: **SQL Editor** in the left sidebar

### Step 3: Run This SQL
Copy and paste this simplified schema (just the essential tables):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_stores TEXT[] DEFAULT ARRAY[]::TEXT[],
  budget_weekly DECIMAL(10, 2),
  household_size INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 4: Click "Run"

### Step 5: Verify Tables Created
1. Click **Table Editor** in left sidebar
2. You should see:
   - `user_profiles`
   - `user_preferences`

## Now Fix Your Existing Users

Your existing users have Auth records but no profiles. Let's fix them:

### Option 1: Delete Users and Re-register (Easiest)

Since you're having trouble deleting from the UI, delete from SQL Editor:

```sql
-- Delete all test users
DELETE FROM auth.users;
```

Then:
1. Go to your app: http://localhost:3050/register
2. Register again with fresh account
3. Try logging in

### Option 2: Create Missing Profiles (Keep existing users)

If you want to keep existing users, create their profiles manually:

```sql
-- Get list of users without profiles
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name' as first_name,
  u.raw_user_meta_data->>'last_name' as last_name,
  u.raw_user_meta_data->>'age' as age
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create missing profiles
INSERT INTO user_profiles (id, first_name, last_name, age)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'first_name', 'Unknown'),
  COALESCE(u.raw_user_meta_data->>'last_name', 'User'),
  CAST(u.raw_user_meta_data->>'age' AS INTEGER)
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create missing preferences
INSERT INTO user_preferences (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN user_preferences p ON u.id = p.user_id
WHERE p.user_id IS NULL;
```

## Test Login Again

After creating the tables:

1. Go to: http://localhost:3050/login
2. Enter your email
3. Enter your password
4. Click "Sign in"

Should work now!

## What to Expect

### If Tables Exist:
- ✅ Login works
- ✅ Profile data loads
- ✅ Redirect to dashboard
- ✅ User info displays correctly

### If Tables Still Don't Exist:
- ❌ Login fails
- ❌ Error in console: "relation user_profiles does not exist"

## Verify It Worked

After login, check browser console (F12):
```
Auth Context - Token: eyJhbGc...
Auth Context - User: {firstName: "...", lastName: "..."}
Auth Context - Is Authenticated: true
```

## Why This Happened

You were creating users in Supabase Auth, but the backend couldn't create the related profile records because:
1. Network issue prevented backend from reaching Supabase
2. Backend tried to create profiles but failed silently
3. Tables might not exist yet

Now we're:
1. Creating tables first
2. Using frontend to login directly (bypasses backend network issue)
3. Fetching profile after successful auth

## Next Steps After Login Works

Once you can login:

1. ✅ Test the dashboard
2. ✅ Check if your name displays
3. ✅ Try navigating around
4. ✅ Test pantry feature (will need backend)
5. ✅ Test other features

## Still Not Working?

If login still fails after creating tables:

1. **Check browser console for errors**
2. **Check Network tab in DevTools**
3. **Try this in console**:
   ```javascript
   // Check if tables exist
   const { data, error } = await supabase
     .from('user_profiles')
     .select('count')
     .limit(1);

   console.log('Profile table exists:', !error);
   console.log('Error if any:', error);
   ```

4. **Clear localStorage and try again**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## TL;DR - Quick Steps

1. **Create tables** in Supabase SQL Editor (copy-paste SQL above)
2. **Delete old users**: `DELETE FROM auth.users;` in SQL Editor
3. **Register new account** at http://localhost:3050/register
4. **Login** with new account
5. **Should work!** ✅
