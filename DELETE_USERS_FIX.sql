-- Fix: Delete users and their related data
-- Run this in Supabase SQL Editor

-- Step 1: Delete from user_preferences first
DELETE FROM user_preferences;

-- Step 2: Delete from user_profiles
DELETE FROM user_profiles;

-- Step 3: Now delete from auth.users
DELETE FROM auth.users;

-- Verify everything is deleted
SELECT 'Auth Users Count:' as info, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'Profiles Count:' as info, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'Preferences Count:' as info, COUNT(*) as count FROM user_preferences;
