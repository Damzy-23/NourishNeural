-- Waste Analytics Schema for Nourish Neural

-- =====================================================
-- WASTE LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pantry_item_id UUID REFERENCES pantry_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit TEXT,
  cost_per_unit DECIMAL(10, 2),
  total_loss DECIMAL(10, 2), -- Calculated as quantity * cost_per_unit
  waste_reason TEXT CHECK (waste_reason IN ('expired', 'spoiled', 'did_not_like', 'accidental', 'other')),
  notes TEXT,
  wasted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waste_logs_user_id ON waste_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_wasted_at ON waste_logs(wasted_at);
CREATE INDEX IF NOT EXISTS idx_waste_logs_category ON waste_logs(category);

-- Enable RLS
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own waste logs"
  ON waste_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waste logs"
  ON waste_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waste logs"
  ON waste_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Analytics View (Optional, but helpful for backend)
CREATE OR REPLACE VIEW waste_analytics_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', wasted_at) as month,
  COUNT(*) as total_items_wasted,
  SUM(total_loss) as total_financial_loss,
  mode() WITHIN GROUP (ORDER BY category) as most_wasted_category
FROM waste_logs
GROUP BY user_id, DATE_TRUNC('month', wasted_at);
