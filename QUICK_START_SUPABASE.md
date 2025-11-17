# ⚡ Quick Start with Supabase - 15 Minutes Setup

Follow these steps to get Nourish Neural running with Supabase in 15 minutes.

## ✅ Checklist

### 1. Create Supabase Account (3 minutes)

```bash
✓ Go to https://supabase.com
✓ Sign up with GitHub
✓ Click "New Project"
✓ Name: nourish-neural
✓ Choose region: Europe West (London)
✓ Wait for project to initialize (~2 min)
```

### 2. Get API Credentials (1 minute)

```bash
✓ Go to Project Settings (gear icon)
✓ Click "API" tab
✓ Copy "Project URL"
✓ Copy "anon public" key
✓ Copy "service_role" key (keep secret!)
```

### 3. Set Up Environment Variables (2 minutes)

**Client:**
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co  # Paste your URL
VITE_SUPABASE_ANON_KEY=eyJhbG...              # Paste anon key
```

**Server:**
```bash
cd ../server
cp .env.example .env
```

Edit `server/.env`:
```bash
SUPABASE_URL=https://xxxxx.supabase.co        # Same URL
SUPABASE_SERVICE_KEY=eyJhbG...                # Paste service key
OPENAI_API_KEY=sk-...                         # Optional (for AI features)
```

### 4. Create Database Schema (3 minutes)

```bash
✓ Open Supabase Dashboard
✓ Click "SQL Editor" in sidebar
✓ Click "New Query"
✓ Open SUPABASE_SETUP_GUIDE.md in this project
✓ Copy the entire SQL schema from Step 4
✓ Paste into SQL Editor
✓ Click "Run" (or Ctrl+Enter)
✓ Should see "Success. No rows returned"
```

### 5. Enable Google OAuth (3 minutes - Optional)

```bash
✓ In Supabase: Authentication → Providers → Google
✓ Toggle "Enable Google"
✓ Note the callback URL shown
✓ Go to Google Cloud Console
✓ Create OAuth 2.0 Client ID
✓ Add callback URL
✓ Copy Client ID & Secret to Supabase
✓ Save
```

**OR** skip this and use email/password auth for now.

### 6. Test the Setup (3 minutes)

**Install dependencies (if you haven't):**
```bash
npm run install:all
```

**Start dev servers:**
```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

**Test in browser:**
```bash
✓ Open http://localhost:3000
✓ Try registering with email/password
✓ Check Supabase Dashboard → Authentication → Users
✓ Should see your new user!
```

---

## 🎉 You're Done!

Your Nourish Neural app is now running with Supabase!

### What You Get:

✅ **PostgreSQL Database** - Fully managed, backed up, scalable
✅ **Authentication** - Email/password + Google OAuth ready
✅ **Row Level Security** - Your data is protected automatically
✅ **Real-time** - Live updates when data changes
✅ **Storage** - Ready for food images and receipts
✅ **Free Tier** - 500MB database, 1GB file storage, 50K users

---

## 🚀 Next Steps

1. **Update useAuth hook** - Already created at `client/src/lib/supabase.ts`
2. **Replace API calls** - Use Supabase client instead of Axios
3. **Add real-time subscriptions** - Get live pantry updates
4. **Upload food images** - Use Supabase Storage
5. **Deploy** - Frontend to Vercel, keep ML server on Railway

---

## 📚 Learn More

- Read full guide: [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
- Supabase Docs: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript

---

## 🆘 Need Help?

Check the troubleshooting section in [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)

**Common issues:**
- "Missing environment variables" → Restart dev servers after adding .env
- "User not found" → Check database trigger was created
- "RLS error" → Make sure you're signed in before querying data
