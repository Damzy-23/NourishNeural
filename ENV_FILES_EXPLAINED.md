# 📝 Environment Files Explained

## Why Two .env Files?

You have **two types of environment files** in both `client/` and `server/`:

| File | Purpose | Git Status | Usage |
|------|---------|-----------|-------|
| `.env` | **Your actual secrets** | ❌ Not committed (in .gitignore) | Used by your app |
| `.env.example` | **Template/documentation** | ✅ Committed to Git | Shows what variables are needed |

---

## 📂 File Locations

```
Nourish Neural/
├── client/
│   ├── .env              ← Your actual Supabase keys (SECRET!)
│   └── .env.example      ← Template for other developers
└── server/
    ├── .env              ← Your actual Supabase keys (SECRET!)
    └── .env.example      ← Template for other developers
```

---

## 🔐 Current Configuration

### Client Environment Variables

**File:** `client/.env`

```bash
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://plbgshkuzoxvudrxxpny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Purpose:**
- `VITE_API_URL` - Where your backend server is running
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public key (safe to use in browser)

**Note:** The `VITE_` prefix is required for Vite to expose these to your React app.

---

### Server Environment Variables

**File:** `server/.env`

```bash
NODE_ENV=development
PORT=5000

# Supabase
SUPABASE_URL=https://plbgshkuzoxvudrxxpny.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key-here

# CORS
CORS_ORIGIN=http://localhost:3050
```

**Purpose:**
- `SUPABASE_URL` - Same as client
- `SUPABASE_SERVICE_KEY` - **ADMIN KEY** (never expose to client!)
- `OPENAI_API_KEY` - For AI assistant features
- `CORS_ORIGIN` - Which frontend URL can access your API

---

## 🚨 Security Rules

### ✅ SAFE to Expose (Client-side):
- `VITE_SUPABASE_URL` - Public project URL
- `VITE_SUPABASE_ANON_KEY` - Anon/public key (protected by RLS)
- `VITE_API_URL` - Your API endpoint

### ❌ NEVER Expose (Server-only):
- `SUPABASE_SERVICE_KEY` - Full admin access!
- `OPENAI_API_KEY` - Costs you money!
- Any other API keys

---

## 🔄 Port Configuration

Your app is currently configured for:

| Service | Port | URL |
|---------|------|-----|
| **Frontend (Vite)** | 3050 | http://localhost:3050 |
| **Backend (Express)** | 5000 | http://localhost:5000 |
| **Supabase** | Cloud | https://plbgshkuzoxvudrxxpny.supabase.co |

**Configured in:**
- Frontend port: `client/vite.config.ts` line 14
- Backend port: `server/.env` PORT variable
- CORS: `server/.env` CORS_ORIGIN variable

---

## 🔧 What I Fixed

### Before:
```bash
# server/.env
CORS_ORIGIN=http://localhost:3000  ❌ Wrong port!
```

### After:
```bash
# server/.env
CORS_ORIGIN=http://localhost:3050  ✅ Matches frontend!
```

This fixes CORS errors when your frontend (running on port 3050) tries to call your backend API.

---

## 🎯 How to Use .env Files

### When Developing:
1. **Never edit `.env.example`** - it's just a template
2. **Edit `.env` directly** - your actual secrets go here
3. **Restart servers** after changing `.env` files

### When Deploying:
1. **Production uses different .env** - Set via hosting platform
2. **Never commit `.env`** - it's in .gitignore
3. **Update `.env.example`** - if you add new variables

### When Sharing Code:
1. **Commit `.env.example`** - so others know what's needed
2. **Never commit `.env`** - contains your secrets!
3. **Document in README** - explain required variables

---

## 🧪 Testing After Changes

After updating `.env` files:

```bash
# 1. Restart backend
cd server
# Press Ctrl+C to stop
npm run dev

# 2. Restart frontend
cd client
# Press Ctrl+C to stop
npm run dev
```

**Why restart?**
- Node.js loads `.env` on startup
- Vite loads `.env` on startup
- Changes won't apply until restart

---

## 📋 Quick Reference

### View Current Config:

```bash
# Client variables
cd client && cat .env

# Server variables
cd server && cat .env
```

### Check if Variables Load:

```bash
# In browser console (client):
console.log(import.meta.env.VITE_SUPABASE_URL)

# In server logs:
console.log(process.env.SUPABASE_URL)
```

### Verify CORS:

```bash
# Should match your frontend port
cd server && grep CORS_ORIGIN .env
```

---

## 🆘 Common Issues

### "CORS error" in browser
**Fix:** Make sure `CORS_ORIGIN` in `server/.env` matches your frontend URL
```bash
CORS_ORIGIN=http://localhost:3050  # Must match vite port!
```

### "Missing Supabase environment variables"
**Fix:** Check both client and server have Supabase credentials
```bash
cd client && grep SUPABASE .env
cd server && grep SUPABASE .env
```

### Changes not applying
**Fix:** Restart both servers
```bash
# Stop both with Ctrl+C, then:
npm run dev  # In both client/ and server/
```

---

## ✅ Verification Checklist

- [ ] `client/.env` has `VITE_SUPABASE_URL`
- [ ] `client/.env` has `VITE_SUPABASE_ANON_KEY`
- [ ] `server/.env` has `SUPABASE_URL`
- [ ] `server/.env` has `SUPABASE_SERVICE_KEY`
- [ ] `server/.env` has `CORS_ORIGIN=http://localhost:3050`
- [ ] Both `.env` files are in `.gitignore`
- [ ] Both servers restarted after changes

---

**Summary:** You're all set! The CORS issue is fixed. Now restart your server and test the registration again! 🚀
