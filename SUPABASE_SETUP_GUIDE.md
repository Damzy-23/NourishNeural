# 🚀 Supabase Setup Guide for Nourish Neural

This guide will walk you through setting up Supabase as your database and authentication provider.

## 📋 Prerequisites

- A Supabase account (free tier is fine)
- Node.js 18+ installed
- Git repository set up

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Click "New Project"
5. Fill in the details:
   - **Name**: `nourish-neural` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Europe West for UK)
   - **Pricing Plan**: Free (500MB database, perfect for development)
6. Click "Create new project"
7. Wait 2-3 minutes for project to initialize

---

## Step 2: Get Your API Keys

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (safe to use in client)
   - **service_role key**: `eyJhbG...` (keep secret, server-only)

**⚠️ IMPORTANT**: Never commit the service_role key to Git!

---

## Step 3: Configure Environment Variables

### Client Environment Variables

Create/update `client/.env`:

```bash
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Server Environment Variables

Create/update `server/.env`:

```bash
# Server
NODE_ENV=development
PORT=5000

# Supabase (for admin operations)
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (for AI assistant)
OPENAI_API_KEY=sk-...

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Replace** `YOUR_PROJECT_ID` and the keys with your actual values from Step 2.

---

## Step 4: Set Up Database Schema

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  age INTEGER,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'UK',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  cuisine_preferences TEXT[] DEFAULT '{}',
  budget_limit DECIMAL(10,2) DEFAULT 200,
  household_size INTEGER DEFAULT 1,
  shopping_frequency VARCHAR(50) DEFAULT 'Weekly',
  preferred_stores TEXT[] DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"emailNotifications": true, "pushNotifications": true, "expiryReminders": true, "shoppingReminders": true, "dealAlerts": false}'::jsonb,
  privacy_settings JSONB DEFAULT '{"shareDataWithPartners": false, "allowAnalytics": true, "publicProfile": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pantry Items
CREATE TABLE public.pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit VARCHAR(50),
  category VARCHAR(100),
  expiry_date DATE,
  purchase_date DATE DEFAULT CURRENT_DATE,
  estimated_price DECIMAL(10,2),
  barcode VARCHAR(50),
  notes TEXT,
  image_url TEXT,
  predicted_expiry_date DATE,
  waste_probability DECIMAL(5,4),
  freshness_score DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grocery Lists
CREATE TABLE public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  store_id UUID,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  total_estimated_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grocery Items
CREATE TABLE public.grocery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit VARCHAR(50),
  category VARCHAR(100),
  estimated_price DECIMAL(10,2),
  is_checked BOOLEAN DEFAULT false,
  notes TEXT,
  barcode VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  chain VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  postcode VARCHAR(20),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  phone VARCHAR(50),
  website TEXT,
  opening_hours JSONB,
  services JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  description TEXT,
  barcode VARCHAR(50) UNIQUE,
  nutrition JSONB,
  allergens TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Prices
CREATE TABLE public.store_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'GBP',
  in_stock BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);

-- Indexes for performance
CREATE INDEX idx_pantry_user ON pantry_items(user_id);
CREATE INDEX idx_pantry_expiry ON pantry_items(expiry_date);
CREATE INDEX idx_pantry_category ON pantry_items(category);
CREATE INDEX idx_grocery_lists_user ON grocery_lists(user_id);
CREATE INDEX idx_grocery_lists_status ON grocery_lists(status);
CREATE INDEX idx_grocery_items_list ON grocery_items(list_id);
CREATE INDEX idx_stores_chain ON stores(chain);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_postcode ON stores(postcode);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own pantry" ON pantry_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own grocery lists" ON grocery_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage items in own lists" ON grocery_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Public read access for stores and products
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can view prices" ON store_prices FOR SELECT USING (true);

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pantry_items_updated_at BEFORE UPDATE ON pantry_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON grocery_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

---

## Step 5: Configure Google OAuth (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable **Google enabled**
4. You'll need to create Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: Add your Supabase callback URL from the Google provider settings
5. Copy the Client ID and Client Secret to Supabase
6. Click **Save**
=
---

## Step 6: Test the Connection

1. Start your development servers:

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

2. Open browser to `http://localhost:3000`
3. Try registering a new account
4. Check Supabase dashboard → **Authentication** → **Users** to see if user was created

---

## Step 7: Import Sample Data (Optional)

To populate your stores and products tables with UK data:

1. Go to **SQL Editor** in Supabase
2. Run this import script (you'll need to adapt your existing JSON data):

```sql
-- Sample stores data
INSERT INTO stores (name, chain, address, city, postcode, latitude, longitude, phone, services) VALUES
('Tesco Extra Manchester', 'Tesco', '123 High Street', 'Manchester', 'M1 1AA', 53.4808, -2.2426, '0800 505 555', '{"deliveryAvailable": true, "clickAndCollect": true, "pharmacy": true}'),
('Sainsburys Central London', 'Sainsburys', '456 Oxford St', 'London', 'W1C 1AP', 51.5155, -0.1426, '0800 636 262', '{"deliveryAvailable": true, "clickAndCollect": true}'),
('Asda Birmingham', 'Asda', '789 Bull Ring', 'Birmingham', 'B5 4BP', 52.4770, -1.8936, '0800 952 0101', '{"deliveryAvailable": true, "petrolStation": true}');

-- Sample products
INSERT INTO products (name, category, brand, barcode, nutrition, allergens) VALUES
('Whole Milk 1L', 'Dairy', 'Tesco', '5000128013338', '{"calories": 64, "protein": 3.3, "fat": 3.7, "carbs": 4.8}'::jsonb, ARRAY['Milk']),
('White Bread', 'Bakery', 'Warburtons', '5010044004215', '{"calories": 265, "protein": 9, "fat": 3, "carbs": 49}'::jsonb, ARRAY['Gluten']),
('Chicken Breast 500g', 'Meat', 'Tesco', '5000128813334', '{"calories": 165, "protein": 31, "fat": 3.6, "carbs": 0}'::jsonb, ARRAY[]::text[]);
```

---

## 🎯 Next Steps

Now that Supabase is set up, you can:

1. **Update your React components** to use Supabase client instead of the API service
2. **Migrate authentication** from mock database to Supabase Auth
3. **Enable real-time subscriptions** for live pantry updates
4. **Add file storage** for food images and receipts
5. **Deploy to production** using Supabase's production database

---

## 🔒 Security Best Practices

✅ **DO:**
- Use environment variables for all secrets
- Enable Row Level Security (RLS) on all tables
- Use the anon key in client-side code
- Use the service role key only in server-side code
- Keep your service role key in `.env` (never commit it!)

❌ **DON'T:**
- Commit `.env` files to Git
- Use service role key in client code
- Disable RLS unless you know what you're doing
- Share your database password publicly

---

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created `.env` files in both `client/` and `server/`
- Restart your dev servers after adding environment variables

### "User not found" after signup
- Check if the trigger `on_auth_user_created` was created successfully
- Go to **Database** → **Functions** in Supabase to verify

### Google OAuth not working
- Double-check your redirect URIs in Google Cloud Console
- Make sure you enabled Google provider in Supabase

### RLS errors (Row Level Security)
- Check that policies were created for all tables
- Verify user is authenticated before making queries

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables set in `client/.env`
- [ ] Environment variables set in `server/.env`
- [ ] Database schema created (all tables and triggers)
- [ ] RLS policies enabled
- [ ] Google OAuth configured (optional)
- [ ] Test signup/login works
- [ ] Sample data imported (optional)

---

**Congratulations!** 🎉 Your Supabase backend is now ready for Nourish Neural!
