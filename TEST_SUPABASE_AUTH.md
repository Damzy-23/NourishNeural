# 🧪 Test Supabase Authentication

## What Changed:

✅ Server now uses **Supabase authentication** instead of mock database
✅ All new users will be saved to Supabase
✅ Authentication uses Supabase Auth with JWT tokens

## Testing Steps:

### 1. Restart Your Server

**IMPORTANT**: You must restart the server to load the new routes!

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd server
npm run dev
```

### 2. Test Registration

1. Open your browser to `http://localhost:3000`
2. Click **Register** or go to `/register`
3. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Age: 25
   - Password: Test123!@#
   - Confirm Password: Test123!@#
   - ✓ Agree to terms
4. Click "Create account"

### 3. Verify in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your "nourish-neural" project
3. Click **Authentication** in the left sidebar
4. Click **Users** tab
5. You should see your new user!

### 4. Check Database Tables

1. In Supabase dashboard, click **Table Editor**
2. Check these tables:
   - **user_profiles** - Should have your user profile
   - **user_preferences** - Should have default preferences

### 5. Test Login

1. Go to `/login`
2. Enter the same credentials you used to register
3. Should log you in successfully and redirect to `/app/dashboard`

---

## Troubleshooting:

### "Supabase not configured" error

**Cause**: Server `.env` file doesn't have Supabase credentials

**Fix**:
```bash
cd server
cat .env  # Check if SUPABASE_URL and SUPABASE_SERVICE_KEY are set
```

Should see:
```
SUPABASE_URL=https://plbgshkuzoxvudrxxpny.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
```

If missing, add them from your Supabase dashboard (Project Settings → API).

### "Email already exists" error

**Cause**: You already registered with that email

**Fix**: Either:
1. Use a different email
2. Or delete the user in Supabase dashboard (Authentication → Users → Delete)

### User created but no profile data

**Cause**: Database trigger might not have run

**Fix**: Check if you ran the SQL schema with the trigger:
```sql
-- This trigger should exist
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Go to Supabase → Database → Functions to verify.

### "Invalid token" when accessing `/app/dashboard`

**Cause**: Token format might be incompatible

**Fix**: Check browser console for errors. The token should be a JWT starting with `eyJ...`

---

## What to Check in Browser DevTools:

### Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Submit registration form
4. Look for `/api/auth/register` request
5. Check Response:
   ```json
   {
     "success": true,
     "user": {
       "id": "...",
       "email": "test@example.com",
       ...
     },
     "token": "eyJ..."
   }
   ```

### Application/Storage Tab:
After successful registration, check:
- **localStorage** → `pantrypal_token` (should have JWT)
- **localStorage** → `pantrypal_user` (should have user JSON)

### Console Tab:
Should see logs like:
```
Auth Context - Token: eyJ...
Auth Context - User: {id: ..., email: ...}
Auth Context - Is Authenticated: true
```

---

## Success Criteria:

✅ Registration form submits without errors
✅ User appears in Supabase Auth panel
✅ User profile created in `user_profiles` table
✅ User preferences created in `user_preferences` table
✅ Token stored in localStorage
✅ Redirected to `/app/dashboard`
✅ Can log out and log back in

---

## Next Steps After Successful Test:

Once authentication works, you can:

1. **Update other API calls** to use Supabase directly
2. **Add Google OAuth** (optional)
3. **Implement real-time pantry updates**
4. **Add file storage** for food images
5. **Deploy to production**

---

## Quick Debug Commands:

```bash
# Check if server has Supabase env vars
cd server && grep SUPABASE .env

# Check if client has Supabase env vars
cd client && grep SUPABASE .env

# View server logs
cd server && npm run dev

# Test auth endpoint directly
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test2@example.com",
    "password": "Test123!@#",
    "age": 25
  }'
```

---

**Good luck! 🚀**

If it works, you'll see your user in Supabase! 🎉
