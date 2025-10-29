
# Vercel Deployment Setup Guide

## Required Environment Variables

To fix the OAuth callback error, you need to set the following environment variables in Vercel:

### 1. Core NextAuth Variables

**NEXTAUTH_URL** (CRITICAL)
```
https://google-ai-studio2.vercel.app
```
⚠️ This MUST match your production domain exactly (no trailing slash)

**NEXTAUTH_SECRET** (CRITICAL)
```
Generate a secure random string using:
openssl rand -base64 32
```
⚠️ This is required for JWT encryption. Without it, authentication will fail.

### 2. Google OAuth Credentials

**GOOGLE_CLIENT_ID**
```
965990089842-q5k43c0u43ipe4itedrnhmqr3edh3ikc.apps.googleusercontent.com
```

**GOOGLE_CLIENT_SECRET**
```
[Your Google Client Secret]
```

### 3. Database Connection

**DATABASE_URL**
```
[Your Supabase PostgreSQL connection string]
```
Format: `postgresql://user:password@host:port/database`

### 4. AI API Keys (Optional for now, needed for AI features)

**GOOGLE_GENERATIVE_AI_API_KEY**
**ANTHROPIC_API_KEY**
**OPENROUTER_API_KEY**

---

## How to Set Environment Variables in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `google-ai-studio2`
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add each variable:
   - Enter the variable name (e.g., `NEXTAUTH_SECRET`)
   - Enter the value
   - Select environments: **Production**, **Preview**, and **Development** (check all three)
   - Click "Save"

6. After adding all variables, you need to **redeploy** the application:
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

---

## Google Cloud Console Setup

Make sure you have configured the redirect URIs in Google Cloud Console:

1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", ensure you have:
   ```
   https://google-ai-studio2.vercel.app/api/auth/callback/google
   ```
   ⚠️ This MUST match exactly (with https, no trailing slash, correct domain)

6. Under "Authorized JavaScript origins", add:
   ```
   https://google-ai-studio2.vercel.app
   ```

7. Click "Save"

---

## Troubleshooting Checklist

- [ ] All environment variables are set in Vercel (especially NEXTAUTH_SECRET and NEXTAUTH_URL)
- [ ] Environment variables are set for all environments (Production, Preview, Development)
- [ ] NEXTAUTH_URL matches your production domain exactly
- [ ] Google Cloud Console redirect URI matches: `https://google-ai-studio2.vercel.app/api/auth/callback/google`
- [ ] After setting variables, you've redeployed the application
- [ ] Database is accessible from Vercel (check DATABASE_URL connection string)
- [ ] Prisma schema is migrated to the database

---

## Testing After Setup

1. Wait for the redeployment to complete
2. Visit https://google-ai-studio2.vercel.app
3. Click "Continue with Google"
4. Complete the Google sign-in flow
5. You should be redirected to /app after successful authentication

If you still see the callback error, check the Vercel deployment logs for specific error messages.
