
# Vercel Environment Configuration Summary

## ⚠️ CRITICAL: You MUST configure these environment variables in Vercel

The OAuth callback error is happening because **environment variables are missing or incorrectly set in Vercel**.

### Step-by-Step Fix:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `google-ai-studio2`
3. **Go to**: Settings → Environment Variables
4. **Add/Update these variables**:

---

### Required Environment Variables:

#### 1. NEXTAUTH_URL (MUST CHANGE)
```
https://google-ai-studio2.vercel.app
```
⚠️ **NOT** `http://localhost:3000` - use the production domain!

#### 2. NEXTAUTH_SECRET
```
xL6J2k+ISRAKjKRJp516TP7gjhkD9UcgDBt7cXMxzhQ=
```
⚠️ Copy this EXACTLY as shown above

#### 3. DATABASE_URL
```
postgresql://role_1691fe1a06:plDusYQqd8Y_46dl32y6aN94CD5B47tb@db-1691fe1a06.db002.hosteddb.reai.io:5432/1691fe1a06
```
⚠️ Copy this EXACTLY as shown above

#### 4. GOOGLE_CLIENT_ID
```
965990089842-q5k43c0u43ipe4itedrnhmqr3edh3ikc.apps.googleusercontent.com
```
⚠️ This is your actual Client ID (the one you provided earlier)

#### 5. GOOGLE_CLIENT_SECRET
```
[Use the Client Secret you have from Google Cloud Console]
```
⚠️ Get this from https://console.cloud.google.com → APIs & Services → Credentials

---

### Important Notes:

1. **For EACH variable**: 
   - Click "Add New" in Vercel
   - Paste the variable name
   - Paste the value
   - Check all 3 boxes: Production, Preview, Development
   - Click "Save"

2. **After adding all variables**:
   - Go to "Deployments" tab
   - Find the latest deployment
   - Click the 3 dots menu
   - Click "Redeploy"
   - Wait for deployment to complete

3. **The most common cause of callback errors**:
   - Missing `NEXTAUTH_SECRET` in Vercel
   - Wrong `NEXTAUTH_URL` (using localhost instead of production domain)
   - Missing `DATABASE_URL` 

---

### Verification Checklist:

After setting all variables and redeploying:

- [ ] NEXTAUTH_URL = `https://google-ai-studio2.vercel.app` (NOT localhost)
- [ ] NEXTAUTH_SECRET is set
- [ ] DATABASE_URL is set
- [ ] GOOGLE_CLIENT_ID is set
- [ ] GOOGLE_CLIENT_SECRET is set
- [ ] All variables are checked for all 3 environments
- [ ] Application has been redeployed
- [ ] Google Cloud Console has redirect URI: `https://google-ai-studio2.vercel.app/api/auth/callback/google`

---

### Test After Configuration:

1. Wait for Vercel deployment to complete (check Deployments tab)
2. Visit: https://google-ai-studio2.vercel.app
3. Click "Continue with Google"
4. Sign in with Google
5. ✅ Should redirect to /app successfully

If you still see the callback error after following these steps, there may be a database connection issue. Check Vercel deployment logs for specific error messages.
