# Vercel Deployment Configuration

## Required Environment Variables

Make sure to set these environment variables in your Vercel project settings:

### Authentication (CRITICAL - Required for login to work)
- `NEXTAUTH_SECRET` - A random secret string (generate with: `openssl rand -base64 32`)
  - **MUST be set for authentication to work**
  - Generate a new one: `openssl rand -base64 32`
  - **Note:** Base URL is automatically detected from Vercel environment (no NEXTAUTH_URL needed)

### Database
- `DATABASE_URL` - Your PostgreSQL connection string

### Google OAuth (if using)
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

### Stripe (if using)
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

### Other
- `RESEND_API_KEY` - For email functionality (if using)
- `CLOUDINARY_CLOUD_NAME` - For image uploads (if using)
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset
- `NEXT_PUBLIC_CLOUDINARY_FOLDER` - Cloudinary folder name

## Important Notes

1. **NEXTAUTH_SECRET** must be a secure random string (required)
2. **Base URL** is automatically detected from Vercel's `VERCEL_URL` environment variable
3. No need to set `NEXTAUTH_URL` - the app uses `base-url.ts` utility which auto-detects the URL
4. After setting environment variables, redeploy your application

## Troubleshooting

If login doesn't work after deployment:

### Step 1: Verify Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Verify `NEXTAUTH_SECRET` is set** (should be a long random string)
3. **Note:** `VERCEL_URL` is automatically set by Vercel - no need to configure it
4. Make sure `NEXTAUTH_SECRET` is set for **Production** environment (not just Preview/Development)

### Step 2: Redeploy
After setting/changing environment variables:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots (⋯) on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### Step 3: Check Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Check `/api/auth/[...nextauth]` function logs
3. Look for any errors related to:
   - Missing NEXTAUTH_SECRET
   - Database connection issues
   - URL detection problems

### Step 4: Test
1. Try logging in with credentials
2. Check browser console for errors
3. Check Network tab for failed API calls

### Common Issues:
- **"Loading..." stuck on signin page**: Usually means NEXTAUTH_SECRET is missing
- **Redirect loops**: Check that VERCEL_URL is being detected correctly (it's auto-set by Vercel)
- **"CredentialsSignin" error**: Check database connection and user credentials

