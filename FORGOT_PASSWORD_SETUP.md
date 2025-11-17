# Forgot Password Setup Guide

## Overview
The forgot password functionality has been successfully implemented using Supabase Auth. This guide will help you configure the email templates and test the password reset flow.

## What Has Been Implemented

### Backend API Endpoints
Located in `server/src/routes/supabase-auth.js`:

1. **POST /api/auth/forgot-password**
   - Sends a password reset email to the user
   - Returns success message (doesn't reveal if email exists for security)
   - Configures redirect URL to http://localhost:3050/reset-password

2. **POST /api/auth/reset-password**
   - Accepts new password and reset token
   - Validates token and updates password
   - Returns success message

### Frontend Pages

1. **ForgotPassword** (`client/src/pages/ForgotPassword.tsx`)
   - Email input form
   - Success confirmation screen
   - Linked from Login page

2. **ResetPassword** (`client/src/pages/ResetPassword.tsx`)
   - Password strength indicator
   - Password confirmation
   - Token extraction from URL hash
   - Auto-redirect to login after success

3. **Routes Added** (`client/src/App.tsx`)
   - `/forgot-password` - Request password reset
   - `/reset-password` - Set new password

## Supabase Email Configuration

### Step 1: Access Email Templates

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/plbgshkuzoxvudrxxpny
2. Navigate to **Authentication** → **Email Templates**
3. Find the **Reset Password** template

### Step 2: Configure Reset Password Email Template

The default template should work, but you can customize it. Here's a recommended template:

```html
<h2>Reset Your Password</h2>

<p>Hi there,</p>

<p>We received a request to reset your password for your Nourish Neural account.</p>

<p>Click the button below to reset your password:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>This link will expire in 1 hour.</strong></p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>

<p>Best regards,<br>The Nourish Neural Team</p>
```

### Step 3: Configure Redirect URLs

1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - For development: `http://localhost:3050/reset-password`
   - For production: `https://yourdomain.com/reset-password`

### Step 4: Configure Site URL

1. In **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3050`
   - Production: `https://yourdomain.com`

### Step 5: Email Rate Limiting

Supabase has built-in rate limiting for password reset emails:
- Max 4 requests per hour per email address
- This prevents abuse and spam

## Testing the Password Reset Flow

### Test Scenario 1: Successful Password Reset

1. **Request Reset**
   - Go to http://localhost:3050/login
   - Click "Forgot password?"
   - Enter a registered email address
   - Click "Send reset link"
   - You should see a success message

2. **Check Email**
   - Check your email inbox (and spam folder)
   - You should receive an email from Supabase
   - Note: In development, emails might take a few minutes

3. **Reset Password**
   - Click the reset link in the email
   - You'll be redirected to http://localhost:3050/reset-password
   - Enter a new password (min 6 characters)
   - Confirm the password
   - Click "Reset password"
   - You should see a success message

4. **Login with New Password**
   - You'll be redirected to /login after 3 seconds
   - Login with your email and new password
   - You should be able to access your account

### Test Scenario 2: Invalid/Expired Token

1. Go to http://localhost:3050/reset-password (without token in URL)
2. You should see an error message: "Invalid or missing reset token"
3. Click "Request new reset link" to go back to forgot password page

### Test Scenario 3: Non-existent Email

1. Go to http://localhost:3050/forgot-password
2. Enter an email that doesn't exist in your system
3. Submit the form
4. You'll still see a success message (security best practice)
5. No email will be sent (user enumeration prevention)

## Security Features Implemented

### 1. Email Enumeration Prevention
- Always returns success message, even for non-existent emails
- Prevents attackers from discovering valid email addresses

### 2. Token-based Authentication
- Uses Supabase's secure JWT tokens for password reset
- Tokens expire after 1 hour (configurable in Supabase)
- One-time use tokens (can't be reused)

### 3. Password Strength Validation
- Minimum 6 characters (Supabase default)
- Maximum 72 characters
- Real-time password strength indicator
- Visual feedback on password requirements

### 4. HTTPS Only (Production)
- Reset links work over HTTP in development
- Use HTTPS in production for security

## Troubleshooting

### Email Not Received

**Check 1: Supabase Email Service**
```bash
# In Supabase Dashboard → Settings → API
# Check if email service is enabled
```

**Check 2: SMTP Configuration**
- Free Supabase projects use limited email service
- Consider configuring custom SMTP for production
- Go to **Project Settings** → **Auth** → **SMTP Settings**

**Check 3: Email Logs**
- Check Supabase logs for email delivery errors
- Go to **Logs** → **Auth Logs**

### Reset Link Not Working

**Issue**: "Invalid reset token" error

**Solutions**:
1. Check if token expired (1 hour limit)
2. Verify redirect URL is configured correctly
3. Make sure you're using the full URL from the email
4. Check browser console for errors

### CORS Error on Reset

**Issue**: CORS error when resetting password

**Solution**:
1. Verify `CORS_ORIGIN=http://localhost:3050` in `server/.env`
2. Restart the server
3. Clear browser cache

## Production Deployment Checklist

- [ ] Configure custom SMTP settings in Supabase
- [ ] Update redirect URLs to production domain
- [ ] Update site URL to production domain
- [ ] Customize email templates with your branding
- [ ] Test email delivery in production
- [ ] Enable HTTPS for all password reset flows
- [ ] Set up email monitoring/logging
- [ ] Configure rate limiting if needed
- [ ] Update CORS_ORIGIN to production domain

## Code Flow Diagram

```
User Flow:
1. User clicks "Forgot password?" on Login page
   ↓
2. Enters email on /forgot-password
   ↓
3. Frontend calls POST /api/auth/forgot-password
   ↓
4. Backend calls supabase.auth.resetPasswordForEmail(email)
   ↓
5. Supabase sends email with reset link
   ↓
6. User clicks link in email
   ↓
7. Redirected to /reset-password?access_token=TOKEN
   ↓
8. User enters new password
   ↓
9. Frontend calls POST /api/auth/reset-password with token
   ↓
10. Backend calls supabase.auth.updateUser({ password })
    ↓
11. Password updated, user redirected to /login
```

## API Reference

### POST /api/auth/forgot-password

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

### POST /api/auth/reset-password

**Request Headers**:
```
Authorization: Bearer <reset_token>
```

**Request Body**:
```json
{
  "password": "newSecurePassword123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Error Response** (401):
```json
{
  "error": "Invalid or expired reset token",
  "details": "Please request a new password reset link"
}
```

## Next Steps

1. **Configure Supabase Email Settings** (see Step 1-4 above)
2. **Test the flow** with a real email address
3. **Customize email template** with your branding
4. **Set up custom SMTP** for production (optional but recommended)

## Support

If you encounter any issues:
1. Check the server logs: Look at the terminal running `npm run dev`
2. Check browser console: Open DevTools → Console
3. Check Supabase logs: Dashboard → Logs → Auth Logs
4. Verify environment variables in `server/.env` and `client/.env`
