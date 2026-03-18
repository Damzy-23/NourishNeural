-- Migration: Add missing columns to user_preferences table
-- Run this in Supabase SQL Editor

-- Add columns that the frontend needs but aren't in the original schema
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS cuisine_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS shopping_frequency TEXT DEFAULT 'Weekly',
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"shareDataWithPartners": false, "allowAnalytics": true, "publicProfile": false}'::jsonb;

-- Update notification_settings default to match frontend shape
-- (existing rows keep their values; new rows get the full shape)
COMMENT ON COLUMN user_preferences.notification_settings IS
  'Shape: {"emailNotifications": bool, "pushNotifications": bool, "expiryReminders": bool, "shoppingReminders": bool, "dealAlerts": bool}';
