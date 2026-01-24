# JWT Secrets Update Guide

**Date:** 2026-01-19
**Status:** 🔒 CRITICAL SECURITY UPDATE

---

## ✅ What We've Done (Local Environment)

### 1. Generated Secure Secrets

Three cryptographically secure secrets have been generated:

```bash
JWT_SECRET (Frontend & Backend): wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE
BETTER_AUTH_SECRET (Frontend):   7w0fXuAiEF3Ewg5qzVyu-Z0_WXm9EmutInGbZdPVvf4
```

### 2. Updated Local Configuration Files

✅ **Frontend:** `frontend/.env.local` - Updated with new secrets
✅ **Backend:** `backend/.env` - Updated with new JWT secret

**IMPORTANT:** Both frontend and backend are now using the SAME JWT_SECRET for token verification.

---

## 🚀 Next Steps: Update Cloud Platforms

You need to update environment variables on both Vercel (frontend) and Hugging Face Spaces (backend).

---

## 📋 STEP 1: Update Vercel Environment Variables (5 minutes)

### Option A: Via Vercel Dashboard (Recommended - Easiest)

1. **Go to Vercel Environment Variables Page:**

   👉 Click here: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app/settings/environment-variables

2. **Update/Add These Variables:**

   | Variable Name | New Value | Environments |
   |--------------|-----------|--------------|
   | `NEXT_PUBLIC_API_URL` | `https://ayeshamasood110-todo-backend-api.hf.space` | ✅ Production, ✅ Preview, ✅ Development |
   | `NEXT_PUBLIC_JWT_SECRET` | `wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE` | ✅ Production, ✅ Preview, ✅ Development |
   | `BETTER_AUTH_SECRET` | `7w0fXuAiEF3Ewg5qzVyu-Z0_WXm9EmutInGbZdPVvf4` | ✅ Production, ✅ Preview, ✅ Development |

3. **For Each Variable:**
   - If it already exists: Click "Edit" → Update value → Save
   - If it doesn't exist: Click "Add New" → Enter name and value → Select all environments → Save

4. **Verify All Three Variables Are Set**

### Option B: Via Vercel CLI (Alternative)

```bash
cd frontend

# Set NEXT_PUBLIC_API_URL
npx vercel env add NEXT_PUBLIC_API_URL production
# When prompted, paste: https://ayeshamasood110-todo-backend-api.hf.space

# Set NEXT_PUBLIC_JWT_SECRET
npx vercel env add NEXT_PUBLIC_JWT_SECRET production
# When prompted, paste: wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE

# Set BETTER_AUTH_SECRET
npx vercel env add BETTER_AUTH_SECRET production
# When prompted, paste: 7w0fXuAiEF3Ewg5qzVyu-Z0_WXm9EmutInGbZdPVvf4
```

---

## 📋 STEP 2: Update Hugging Face Spaces Environment Variables (5 minutes)

### Via Hugging Face Dashboard

1. **Go to Your Space Settings:**

   👉 Visit: https://huggingface.co/spaces/ayeshamasood110/todo-backend-api/settings

2. **Navigate to "Variables and secrets" Section**

3. **Add/Update These Variables:**

   | Variable Name | New Value |
   |--------------|-----------|
   | `JWT_SECRET` | `wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE` |
   | `FRONTEND_URL` | `https://todo-full-stack-app-tau.vercel.app` |
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_y2AiIhgS1DTE@ep-small-resonance-ah8koezx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |

4. **For Each Variable:**
   - Click "New secret" or "New variable"
   - Enter the name
   - Enter the value
   - Click "Save"

5. **Important Notes:**
   - `JWT_SECRET` must match the frontend's `NEXT_PUBLIC_JWT_SECRET`
   - `FRONTEND_URL` should be your production Vercel URL for CORS
   - `DATABASE_URL` should already exist, but verify it's correct

---

## 📋 STEP 3: Redeploy Both Applications

### A. Redeploy Frontend (Vercel)

**Method 1: Via Dashboard (Easiest)**

1. Go to: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app
2. Click "Deployments" tab
3. Find the latest deployment
4. Click the "..." menu → "Redeploy"
5. Confirm "Redeploy"
6. Wait for deployment to complete (~2 minutes)

**Method 2: Via Git Push**

```bash
# Make a small change to trigger deployment
cd frontend
git commit --allow-empty -m "Trigger redeploy with updated environment variables"
git push origin master
```

### B. Redeploy Backend (Hugging Face Spaces)

**Hugging Face Spaces automatically redeploys when you:**
- Update environment variables (already done in Step 2)
- Push new code to the repository

**To verify redeployment:**
1. Go to: https://huggingface.co/spaces/ayeshamasood110/todo-backend-api
2. Check the "Logs" tab
3. You should see "Building..." or "Running"
4. Wait for status to show "Running" (~2-3 minutes)

**If it doesn't auto-redeploy:**
1. Go to space settings
2. Click "Factory reboot" or "Restart this Space"

---

## 📋 STEP 4: Test Your Application (5 minutes)

### 1. Wait for Both Deployments to Complete

- **Vercel:** Check deployment status at https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app
- **HF Spaces:** Check logs at https://huggingface.co/spaces/ayeshamasood110/todo-backend-api

### 2. Test Backend API

```bash
# Test health endpoint
curl https://ayeshamasood110-todo-backend-api.hf.space/

# Should return: {"message": "Todo API is running"}
```

Or visit: https://ayeshamasood110-todo-backend-api.hf.space/docs

### 3. Test Frontend Application

1. **Visit:** https://todo-full-stack-app-tau.vercel.app
2. **Sign Up:** Create a new test account
3. **Sign In:** Log in with the test account
4. **Create Task:** Add a new task
5. **Verify:** Task should save and display correctly

### 4. Test Authentication Flow

1. Sign out
2. Try to access `/tasks` directly
3. Should redirect to `/signin`
4. Sign in again
5. Should redirect to `/tasks` with your data

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Vercel environment variables are set (3 variables)
- [ ] HF Spaces environment variables are set (3 variables)
- [ ] Frontend redeployed successfully
- [ ] Backend redeployed successfully
- [ ] Backend API responds at `/docs` endpoint
- [ ] Frontend loads without errors
- [ ] Can sign up new user
- [ ] Can sign in with user
- [ ] Can create tasks
- [ ] Can view tasks
- [ ] Can edit tasks
- [ ] Can delete tasks
- [ ] Can toggle task completion
- [ ] Can sign out

---

## 🔒 Security Verification

### Verify JWT Secrets Match

**Frontend (Vercel):**
```
NEXT_PUBLIC_JWT_SECRET = wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE
```

**Backend (HF Spaces):**
```
JWT_SECRET = wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE
```

**These MUST be identical for authentication to work!**

### Verify CORS Configuration

**Backend should allow requests from:**
```
FRONTEND_URL = https://todo-full-stack-app-tau.vercel.app
```

---

## 🚨 Troubleshooting

### Issue: "Invalid token" or "Unauthorized" errors

**Cause:** JWT secrets don't match between frontend and backend

**Fix:**
1. Double-check both secrets are identical
2. Ensure no extra spaces or characters
3. Redeploy both applications
4. Clear browser cache and try again

### Issue: CORS errors in browser console

**Cause:** Backend CORS not configured for production frontend URL

**Fix:**
1. Verify `FRONTEND_URL` in HF Spaces is set to: `https://todo-full-stack-app-tau.vercel.app`
2. Restart HF Space
3. Clear browser cache

### Issue: "Cannot connect to API" errors

**Cause:** Backend not running or frontend has wrong API URL

**Fix:**
1. Check HF Space is running: https://huggingface.co/spaces/ayeshamasood110/todo-backend-api
2. Verify `NEXT_PUBLIC_API_URL` in Vercel is: `https://ayeshamasood110-todo-backend-api.hf.space`
3. Test backend directly: https://ayeshamasood110-todo-backend-api.hf.space/docs

### Issue: Environment variables not taking effect

**Cause:** Deployment didn't pick up new variables

**Fix:**
1. Trigger manual redeploy on Vercel
2. Factory reboot HF Space
3. Wait 2-3 minutes for both to complete

---

## 📊 Environment Variables Summary

### Frontend (Vercel) - 3 Variables

```env
NEXT_PUBLIC_API_URL=https://ayeshamasood110-todo-backend-api.hf.space
NEXT_PUBLIC_JWT_SECRET=wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE
BETTER_AUTH_SECRET=7w0fXuAiEF3Ewg5qzVyu-Z0_WXm9EmutInGbZdPVvf4
```

### Backend (HF Spaces) - 3 Variables

```env
JWT_SECRET=wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE
FRONTEND_URL=https://todo-full-stack-app-tau.vercel.app
DATABASE_URL=postgresql://neondb_owner:npg_y2AiIhgS1DTE@ep-small-resonance-ah8koezx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 🔐 Security Best Practices

✅ **Implemented:**
- Strong, random JWT secrets (32 bytes, URL-safe)
- Secrets are different for different purposes
- Secrets stored in environment variables (not in code)
- HTTPS enabled on both platforms
- Proper CORS configuration

⚠️ **Remember:**
- Never commit `.env` files to git
- Never share secrets publicly
- Rotate secrets periodically (every 3-6 months)
- Use different secrets for development and production

---

## 📝 Quick Reference

**Vercel Dashboard:**
- Project: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app
- Env Vars: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app/settings/environment-variables
- Deployments: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app/deployments

**Hugging Face Spaces:**
- Space: https://huggingface.co/spaces/ayeshamasood110/todo-backend-api
- Settings: https://huggingface.co/spaces/ayeshamasood110/todo-backend-api/settings
- Logs: https://huggingface.co/spaces/ayeshamasood110/todo-backend-api/logs

**Production URLs:**
- Frontend: https://todo-full-stack-app-tau.vercel.app
- Backend: https://ayeshamasood110-todo-backend-api.hf.space
- API Docs: https://ayeshamasood110-todo-backend-api.hf.space/docs

---

## ⏱️ Estimated Time

- **Step 1 (Vercel):** 5 minutes
- **Step 2 (HF Spaces):** 5 minutes
- **Step 3 (Redeploy):** 5 minutes (automated)
- **Step 4 (Testing):** 5 minutes
- **Total:** ~20 minutes

---

## 🎯 Success Criteria

Your JWT secrets update is complete when:

1. ✅ All environment variables are set on both platforms
2. ✅ Both applications have been redeployed
3. ✅ You can sign up and sign in successfully
4. ✅ You can create, view, edit, and delete tasks
5. ✅ No authentication errors in browser console
6. ✅ No CORS errors in browser console

---

**Guide Created By:** Claude Code (Sonnet 4.5)
**Date:** 2026-01-19
**Priority:** 🔴 CRITICAL SECURITY UPDATE
