-- Nourish Neural - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
-- Extends Supabase Auth users with additional profile data
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

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_stores TEXT[] DEFAULT ARRAY[]::TEXT[],
  budget_weekly DECIMAL(10, 2),
  household_size INTEGER DEFAULT 1,
  waste_reduction_goal BOOLEAN DEFAULT TRUE,
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "expiry_alerts": true}'::jsonb,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PANTRY ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pieces',
  category TEXT NOT NULL DEFAULT 'General',
  expiry_date DATE,
  purchase_date DATE DEFAULT CURRENT_DATE,
  estimated_price DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),
  barcode TEXT,
  store_name TEXT,
  brand TEXT,
  notes TEXT,
  image_url TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiry_date ON pantry_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_pantry_items_category ON pantry_items(category);
CREATE INDEX IF NOT EXISTS idx_pantry_items_barcode ON pantry_items(barcode);

-- Enable RLS
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pantry_items
CREATE POLICY "Users can view their own pantry items"
  ON pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items"
  ON pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items"
  ON pantry_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items"
  ON pantry_items FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- GROCERY LISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  total_estimated_cost DECIMAL(10, 2) DEFAULT 0,
  total_actual_cost DECIMAL(10, 2),
  preferred_store TEXT,
  shopping_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_status ON grocery_lists(status);

-- Enable RLS
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grocery_lists
CREATE POLICY "Users can view their own grocery lists"
  ON grocery_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grocery lists"
  ON grocery_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grocery lists"
  ON grocery_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grocery lists"
  ON grocery_lists FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- GROCERY LIST ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS grocery_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pieces',
  category TEXT NOT NULL DEFAULT 'General',
  estimated_price DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),
  is_checked BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  barcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grocery_list_items_list_id ON grocery_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_grocery_list_items_category ON grocery_list_items(category);

-- Enable RLS
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grocery_list_items (inherit from parent list)
CREATE POLICY "Users can view items in their grocery lists"
  ON grocery_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items in their grocery lists"
  ON grocery_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their grocery lists"
  ON grocery_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their grocery lists"
  ON grocery_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- =====================================================
-- RECIPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 4,
  ingredients JSONB NOT NULL, -- [{name, quantity, unit}]
  instructions JSONB NOT NULL, -- [{step, description}]
  nutrition_info JSONB, -- {calories, protein, carbs, fat}
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  source TEXT, -- 'user' or 'ai' or 'imported'
  is_favorite BOOLEAN DEFAULT FALSE,
  times_cooked INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_type ON recipes(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- MEAL PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  meals JSONB NOT NULL, -- {date: {breakfast: recipe_id, lunch: recipe_id, dinner: recipe_id}}
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_dates ON meal_plans(start_date, end_date);

-- Enable RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their own meal plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- AI INTERACTIONS TABLE (for logging AI assistant usage)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'recipe_suggestion', 'meal_plan', 'pantry_analysis', etc.
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  metadata JSONB, -- additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type);

-- Enable RLS
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_interactions
CREATE POLICY "Users can view their own AI interactions"
  ON ai_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI interactions"
  ON ai_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STORES TABLE (reference data)
-- =====================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postcode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  opening_hours JSONB, -- {monday: {open: "09:00", close: "21:00"}}
  features TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['parking', 'pharmacy', 'bakery']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_chain ON stores(chain);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_postcode ON stores(postcode);

-- Enable RLS (public read access)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores (everyone can read)
CREATE POLICY "Anyone can view stores"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pantry_items_updated_at
  BEFORE UPDATE ON pantry_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON grocery_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_list_items_updated_at
  BEFORE UPDATE ON grocery_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (optional - for testing)
-- =====================================================

-- Insert some sample UK stores
INSERT INTO stores (name, chain, address, city, postcode, latitude, longitude, features) VALUES
  ('Tesco Extra', 'Tesco', '123 High Street', 'London', 'SW1A 1AA', 51.5074, -0.1278, ARRAY['parking', 'pharmacy', 'bakery', 'cafe']::TEXT[]),
  ('Sainsbury''s Superstore', 'Sainsbury''s', '456 Market Road', 'Manchester', 'M1 1AA', 53.4808, -2.2426, ARRAY['parking', 'bakery']::TEXT[]),
  ('Asda Supercentre', 'Asda', '789 Shopping Way', 'Birmingham', 'B1 1AA', 52.4862, -1.8904, ARRAY['parking', 'pharmacy', 'cafe']::TEXT[]),
  ('Morrisons', 'Morrisons', '321 Town Square', 'Leeds', 'LS1 1AA', 53.8008, -1.5491, ARRAY['parking', 'bakery', 'butcher']::TEXT[]),
  ('Waitrose', 'Waitrose', '654 Park Lane', 'Oxford', 'OX1 1AA', 51.7520, -1.2577, ARRAY['cafe', 'bakery']::TEXT[])
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS (for common queries)
-- =====================================================

-- View for items expiring soon
CREATE OR REPLACE VIEW expiring_soon_items AS
SELECT
  pi.*,
  up.first_name,
  up.last_name,
  (pi.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM pantry_items pi
JOIN user_profiles up ON pi.user_id = up.id
WHERE pi.expiry_date IS NOT NULL
  AND pi.expiry_date <= CURRENT_DATE + INTERVAL '7 days'
  AND pi.expiry_date >= CURRENT_DATE
  AND pi.is_archived = FALSE
ORDER BY pi.expiry_date ASC;

-- View for pantry statistics per user
CREATE OR REPLACE VIEW pantry_stats AS
SELECT
  user_id,
  COUNT(*) AS total_items,
  SUM(estimated_price) AS total_estimated_value,
  SUM(CASE WHEN expiry_date <= CURRENT_DATE + INTERVAL '3 days' AND expiry_date >= CURRENT_DATE THEN 1 ELSE 0 END) AS expiring_soon_count,
  SUM(CASE WHEN expiry_date < CURRENT_DATE THEN 1 ELSE 0 END) AS expired_count,
  SUM(CASE WHEN quantity <= 1 THEN 1 ELSE 0 END) AS low_stock_count,
  COUNT(DISTINCT category) AS categories_count
FROM pantry_items
WHERE is_archived = FALSE
GROUP BY user_id;

-- =====================================================
-- HOUSEHOLDS TABLE (Collaboration)
-- =====================================================
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_households_invite_code ON households(invite_code);
CREATE INDEX IF NOT EXISTS idx_households_created_by ON households(created_by);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view household"
  ON households FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create households"
  ON households FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Household admins can update household"
  ON households FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

CREATE POLICY "Household admins can delete household"
  ON households FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HOUSEHOLD MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Enforce one household per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_household_per_user ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);

ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view household members"
  ON household_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members AS hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join households"
  ON household_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM household_members AS hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
      AND hm.role = 'admin'
    )
  );

CREATE POLICY "Admins can remove members or self-remove"
  ON household_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM household_members AS hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
      AND hm.role = 'admin'
    )
  );

-- =====================================================
-- ADD household_id TO EXISTING TABLES
-- =====================================================
ALTER TABLE pantry_items
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_pantry_items_household_id ON pantry_items(household_id);

ALTER TABLE grocery_lists
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_grocery_lists_household_id ON grocery_lists(household_id);

ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_meal_plans_household_id ON meal_plans(household_id);

-- =====================================================
-- UPDATE RLS POLICIES FOR HOUSEHOLD ACCESS
-- =====================================================

-- pantry_items
DROP POLICY IF EXISTS "Users can view their own pantry items" ON pantry_items;
CREATE POLICY "Users can view own or household pantry items"
  ON pantry_items FOR SELECT
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = pantry_items.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert their own pantry items" ON pantry_items;
CREATE POLICY "Users can insert own or household pantry items"
  ON pantry_items FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (household_id IS NULL OR EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = pantry_items.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update their own pantry items" ON pantry_items;
CREATE POLICY "Users can update own or household pantry items"
  ON pantry_items FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = pantry_items.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete their own pantry items" ON pantry_items;
CREATE POLICY "Users can delete own or household pantry items"
  ON pantry_items FOR DELETE
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = pantry_items.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

-- grocery_lists
DROP POLICY IF EXISTS "Users can view their own grocery lists" ON grocery_lists;
CREATE POLICY "Users can view own or household grocery lists"
  ON grocery_lists FOR SELECT
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert their own grocery lists" ON grocery_lists;
CREATE POLICY "Users can insert own or household grocery lists"
  ON grocery_lists FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (household_id IS NULL OR EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update their own grocery lists" ON grocery_lists;
CREATE POLICY "Users can update own or household grocery lists"
  ON grocery_lists FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete their own grocery lists" ON grocery_lists;
CREATE POLICY "Users can delete own or household grocery lists"
  ON grocery_lists FOR DELETE
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

-- meal_plans
DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;
CREATE POLICY "Users can view own or household meal plans"
  ON meal_plans FOR SELECT
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert their own meal plans" ON meal_plans;
CREATE POLICY "Users can insert own or household meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (household_id IS NULL OR EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
CREATE POLICY "Users can update own or household meal plans"
  ON meal_plans FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own or household meal plans"
  ON meal_plans FOR DELETE
  USING (
    auth.uid() = user_id
    OR (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
    ))
  );

-- =====================================================
-- LOYALTY CARDS TABLE
-- =====================================================
-- Persistent storage for user loyalty card accounts
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  card_number TEXT NOT NULL,
  is_linked BOOLEAN DEFAULT TRUE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loyalty cards"
  ON loyalty_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loyalty cards"
  ON loyalty_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loyalty cards"
  ON loyalty_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loyalty cards"
  ON loyalty_cards FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_cards_user_id ON loyalty_cards(user_id);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Schema created successfully!
-- Next steps:
-- 1. Run the household migration SQL in Supabase SQL editor
-- 2. Review the tables and RLS policies
-- 3. Test with sample data
