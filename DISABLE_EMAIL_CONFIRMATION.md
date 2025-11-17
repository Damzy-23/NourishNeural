# Fix: Disable Email Confirmation in Supabase

## Problem
Registration fails with: "Registration failed - no user or session returned"

## Cause
Supabase is set to require email confirmation by default. When a user registers, Supabase:
1. Creates the user
2. Sends confirmation email
3. Does NOT return a session until email is confirmed

## Solution - Disable Email Confirmation

### Go to Supabase Dashboard
https://supabase.com/dashboard/project/plbgshkuzoxvudrxxpny

### Navigate to Authentication Settings
1. Click **Authentication** in left sidebar
2. Click **Providers**
3. Scroll down to **Email**
4. Click **Edit** (pencil icon)

### Disable Confirmation
Look for "Confirm email" and **UNCHECK** the box that says:
- **"Enable email confirmations"**

or

Look for "Email confirmation" setting and set it to **Disabled**

### Save Changes
Click **Save**

## Alternative: Auto-confirm Users with SQL

If you can't find the setting, run this SQL to auto-confirm existing users:

```sql
-- Auto-confirm all users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

## Test Again

1. Delete old users:
   ```sql
   DELETE FROM user_preferences;
   DELETE FROM user_profiles;
   DELETE FROM auth.users;
   ```

2. Go to http://localhost:3050/register
3. Register new account
4. Should work immediately now!

## What This Does

**Before**: User → Register → Email sent → Must click link → Then can login
**After**: User → Register → Immediately logged in ✅

This is fine for development. In production, you may want email confirmation enabled.
