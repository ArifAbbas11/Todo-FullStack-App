# Vercel Environment Variables Configuration Guide

## 🔧 Required Environment Variables for Production

Your backend is deployed and running at:
**https://ayeshamasood110-todo-backend-api.hf.space**

To connect your Vercel frontend to the production backend, you need to configure these environment variables in Vercel:

---

## 📋 Environment Variables to Set

### 1. NEXT_PUBLIC_API_URL
- **Value:** `https://ayeshamasood110-todo-backend-api.hf.space`
- **Type:** Plain Text
- **Target:** Production, Preview, Development
- **Description:** Backend API URL for the frontend to communicate with

### 2. BETTER_AUTH_SECRET
- **Value:** `your-super-secret-jwt-key-change-this-in-production`
- **Type:** Encrypted (Sensitive)
- **Target:** Production, Preview, Development
- **Description:** Secret key for Better Auth authentication
- **⚠️ SECURITY WARNING:** This is currently using the default weak secret. Generate a secure one!

### 3. NEXT_PUBLIC_JWT_SECRET
- **Value:** `your-super-secret-jwt-key-change-this-in-production`
- **Type:** Plain Text (needs to match backend)
- **Target:** Production, Preview, Development
- **Description:** JWT secret for token verification (must match backend)
- **⚠️ SECURITY WARNING:** This is currently using the default weak secret. Generate a secure one!

---

## 🔐 CRITICAL SECURITY ISSUE

**Your JWT secrets are using the default weak value!**

Both your frontend and backend are using:
```
your-super-secret-jwt-key-change-this-in-production
```

This is a **MAJOR SECURITY RISK** in production. Anyone can generate valid JWT tokens!

### Generate Secure Secrets

Run this command to generate a secure secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Example output:
```
xK9mP2vN8qR5tL7wY3zB6cF4hJ1dG0sA8eU9iO2pM5nQ7rT4vW6xY8zA3bC5dE7f
```

**You MUST update this in:**
1. Backend `.env` file (JWT_SECRET)
2. Frontend `.env.local` file (NEXT_PUBLIC_JWT_SECRET and BETTER_AUTH_SECRET)
3. Vercel environment variables
4. Redeploy both frontend and backend

---

## 🚀 How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Project Settings:**
   - Visit: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app/settings/environment-variables

2. **Add Each Variable:**
   - Click "Add New" button
   - Enter the variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - Enter the value
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

3. **Repeat for all 3 variables**

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Select "Redeploy"
   - Or push a new commit to trigger automatic deployment

### Method 2: Vercel CLI

```bash
cd frontend

# Set NEXT_PUBLIC_API_URL
npx vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://ayeshamasood110-todo-backend-api.hf.space

# Set BETTER_AUTH_SECRET
npx vercel env add BETTER_AUTH_SECRET production
# When prompted, enter your JWT secret

# Set NEXT_PUBLIC_JWT_SECRET
npx vercel env add NEXT_PUBLIC_JWT_SECRET production
# When prompted, enter your JWT secret (same as above)

# Repeat for preview and development environments
```

### Method 3: Vercel API (Advanced)

```bash
# Using curl with Vercel API
curl -X POST "https://api.vercel.com/v10/projects/prj_TTWlxrdxHhVLSxEp1VBgkjrhIweW/env" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXT_PUBLIC_API_URL",
    "value": "https://ayeshamasood110-todo-backend-api.hf.space",
    "type": "plain",
    "target": ["production", "preview", "development"]
  }'
```

---

## ✅ Verification Checklist

After setting environment variables and redeploying:

- [ ] Visit: https://todo-full-stack-app-tau.vercel.app
- [ ] Open browser DevTools → Network tab
- [ ] Try to sign up with a new account
- [ ] Check if API calls go to `https://ayeshamasood110-todo-backend-api.hf.space`
- [ ] Verify signup succeeds (no CORS errors)
- [ ] Try to sign in
- [ ] Create a new task
- [ ] Verify task appears in the list
- [ ] Toggle task completion
- [ ] Delete a task
- [ ] Sign out and sign back in

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Symptom:** Browser console shows CORS policy errors

**Solution:** Update backend CORS configuration to allow Vercel domain:
```python
# In backend, update FRONTEND_URL in .env or CORS settings
FRONTEND_URL=https://todo-full-stack-app-tau.vercel.app
```

### Issue 2: 401 Unauthorized Errors
**Symptom:** API returns 401 after login

**Solution:** Ensure JWT secrets match exactly between frontend and backend

### Issue 3: Environment Variables Not Applied
**Symptom:** Frontend still uses localhost

**Solution:**
1. Verify variables are set in Vercel dashboard
2. Trigger a new deployment (don't just redeploy)
3. Check build logs to confirm variables are loaded

### Issue 4: API Timeout
**Symptom:** Requests to backend timeout

**Solution:**
1. Check if Hugging Face Space is awake (may sleep after inactivity)
2. Visit backend URL directly to wake it up
3. Consider upgrading to persistent deployment

---

## 📊 Current Configuration Status

### Local Development (.env.local)
- ✅ NEXT_PUBLIC_API_URL: Updated to production backend
- ⚠️ JWT Secrets: Using default weak values

### Vercel Production
- ❌ NEXT_PUBLIC_API_URL: Not set (needs configuration)
- ❌ BETTER_AUTH_SECRET: Not set (needs configuration)
- ❌ NEXT_PUBLIC_JWT_SECRET: Not set (needs configuration)

### Backend (Hugging Face)
- ✅ Deployed and running
- ✅ API accessible at https://ayeshamasood110-todo-backend-api.hf.space
- ⚠️ JWT_SECRET: Using default weak value
- ⚠️ FRONTEND_URL: Set to localhost (may cause CORS issues)

---

## 🎯 Immediate Action Items

1. **Set Vercel Environment Variables** (5 minutes)
   - Use Vercel Dashboard method above
   - Set all 3 variables

2. **Generate Secure JWT Secret** (2 minutes)
   - Run: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Save the output securely

3. **Update Backend Configuration** (3 minutes)
   - Update JWT_SECRET in backend
   - Update FRONTEND_URL to Vercel domain
   - Redeploy backend on Hugging Face

4. **Update Frontend Configuration** (2 minutes)
   - Update JWT secrets in Vercel env vars
   - Trigger Vercel redeploy

5. **Test Production Deployment** (5 minutes)
   - Follow verification checklist above

**Total Time:** ~20 minutes

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check Hugging Face Space logs
3. Check browser console for errors
4. Verify all environment variables are set correctly

**Vercel Dashboard:** https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app
**Backend URL:** https://ayeshamasood110-todo-backend-api.hf.space/docs
