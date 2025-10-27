# Clear User Data Instructions

To test the fixed authentication system with fresh data:

## Method 1: Clear Browser Data (Recommended)
1. Open your browser's Developer Tools (F12)
2. Go to the "Application" tab
3. Under "Storage" section, click on "Local Storage"
4. Delete all entries for your PantryPal domain
5. Refresh the page

## Method 2: Clear Specific Keys
1. Open browser console (F12)
2. Run these commands:
```javascript
localStorage.removeItem('pantrypal_token')
localStorage.removeItem('pantrypal_user')
```

## Method 3: Reset Server Database
The mock database will reset when you restart the server, but existing users will remain until server restart.

## Testing Steps:
1. Clear browser data (Method 1 or 2)
2. Register a new account with your real information
3. Check profile page - should show YOUR data, not "John Doe"
4. Try to register again with same email - should get error
5. Log out and log back in - should maintain your data

## What's Fixed:
✅ Profile shows actual user data (not "John Doe")
✅ Email uniqueness validation prevents duplicates
✅ Age field added to registration
✅ Proper authentication flow
✅ Data persistence across sessions
