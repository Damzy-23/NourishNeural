-- ============================================================================
-- NourishNeural — 7-Feature Migration
-- Run in Supabase SQL Editor
-- ============================================================================

-- ─── 1. Nutrition Profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nutrition_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dietary_type TEXT DEFAULT 'omnivore',
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  intolerances TEXT[] DEFAULT ARRAY[]::TEXT[],
  disliked_ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  calorie_target INTEGER,
  protein_target INTEGER,
  carb_target INTEGER,
  fat_target INTEGER,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own nutrition profile"
  ON nutrition_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Household members can view profiles"
  ON nutrition_profiles FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ─── 2. Product Cache (OpenFoodFacts) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_cache (
  barcode TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  nutrition_per_100g JSONB,
  image_url TEXT,
  nova_group INTEGER,
  nutri_score TEXT,
  ecoscore TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS — server-only writes, public reads
ALTER TABLE product_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product cache"
  ON product_cache FOR SELECT USING (true);

-- ─── 3. Carbon Footprint ────────────────────────────────────────────────────
ALTER TABLE pantry_items
  ADD COLUMN IF NOT EXISTS carbon_score DECIMAL(6,2);

CREATE TABLE IF NOT EXISTS carbon_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  co2_per_kg DECIMAL(6,2) NOT NULL,
  source TEXT DEFAULT 'Poore & Nemecek 2018',
  UNIQUE(category, item_name)
);

ALTER TABLE carbon_reference ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read carbon reference"
  ON carbon_reference FOR SELECT USING (true);

-- Seed ~30 common UK food categories (Poore & Nemecek 2018 data)
INSERT INTO carbon_reference (category, item_name, co2_per_kg) VALUES
  ('Meat', 'beef', 27.0),
  ('Meat', 'lamb', 24.0),
  ('Meat', 'pork', 7.6),
  ('Meat', 'chicken', 6.9),
  ('Meat', 'turkey', 5.5),
  ('Fish', 'fish', 5.4),
  ('Fish', 'prawns', 12.0),
  ('Fish', 'tuna', 6.1),
  ('Dairy', 'cheese', 13.5),
  ('Dairy', 'milk', 3.2),
  ('Dairy', 'butter', 11.9),
  ('Dairy', 'yogurt', 2.5),
  ('Dairy', 'cream', 7.6),
  ('Dairy', 'eggs', 4.8),
  ('Vegetables', 'tomatoes', 2.1),
  ('Vegetables', 'potatoes', 0.5),
  ('Vegetables', 'onions', 0.4),
  ('Vegetables', 'carrots', 0.4),
  ('Vegetables', 'broccoli', 0.9),
  ('Vegetables', 'peppers', 1.0),
  ('Fruits', 'bananas', 0.9),
  ('Fruits', 'apples', 0.4),
  ('Fruits', 'berries', 1.5),
  ('Fruits', 'oranges', 0.5),
  ('Grains', 'rice', 4.0),
  ('Grains', 'bread', 1.6),
  ('Grains', 'pasta', 1.8),
  ('Grains', 'oats', 1.6),
  ('Legumes', 'lentils', 0.9),
  ('Legumes', 'beans', 0.8),
  ('Legumes', 'chickpeas', 0.7),
  ('Nuts', 'nuts', 2.3),
  ('Beverages', 'coffee', 16.5),
  ('Beverages', 'tea', 0.2),
  ('Bakery', 'cake', 3.5),
  ('Snacks', 'chocolate', 19.0),
  ('Frozen', 'frozen veg', 0.8),
  ('Oils', 'olive oil', 6.0),
  ('Condiments', 'sugar', 3.2),
  ('Tofu', 'tofu', 2.0)
ON CONFLICT DO NOTHING;

-- ─── 4. Smart Appliance Hooks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appliance_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_name TEXT NOT NULL,
  device_type TEXT DEFAULT 'fridge',
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appliance_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appliance tokens"
  ON appliance_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS appliance_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES appliance_tokens(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  item_data JSONB NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appliance_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Token owners can view sync logs"
  ON appliance_sync_log FOR SELECT
  USING (
    token_id IN (
      SELECT id FROM appliance_tokens WHERE user_id = auth.uid()
    )
  );

-- ─── 5. Waste Alerts ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waste_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pantry_item_id UUID REFERENCES pantry_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  waste_probability DECIMAL(4,3),
  predicted_days_left INTEGER,
  alert_type TEXT DEFAULT 'waste_risk',
  suggestion TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_alerts_user
  ON waste_alerts(user_id, is_dismissed, created_at DESC);

ALTER TABLE waste_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waste alerts"
  ON waste_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 6. Voice Input — no DB changes needed (frontend only) ─────────────────

-- ─── 7. Community Waste Challenges ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waste_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  target_value DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waste_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read challenges"
  ON waste_challenges FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES waste_challenges(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  score DECIMAL(10,2) DEFAULT 0,
  items_saved INTEGER DEFAULT 0,
  waste_avoided_kg DECIMAL(10,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, household_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Household members can view participation"
  ON challenge_participants FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Household members can join challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Household members can update scores"
  ON challenge_participants FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Seed initial challenges
INSERT INTO waste_challenges (title, description, challenge_type, target_value, start_date, end_date) VALUES
  ('Zero Waste Week', 'Log zero food waste for 7 consecutive days. Can you do it?', 'zero_waste', 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
  ('Use It Up Champion', 'Consume 10 items that are within 3 days of expiring before they go to waste.', 'use_expiring', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
  ('Carbon Cutter', 'Reduce your weekly carbon footprint by choosing lower-impact foods.', 'carbon_cut', 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;
