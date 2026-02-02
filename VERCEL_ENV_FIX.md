# Vercel Environment Variable Error - Quick Fix Guide

**Error:** `Environment Variable "BETTER_AUTH_SECRET" references Secret "better-auth-secret", which does not exist.`

**Cause:** When setting up environment variables in Vercel, you selected "Secret" type instead of "Plain Text" type.

---

## 🔧 Quick Fix (5 minutes)

### Step 1: Delete the Incorrectly Configured Variables

1. **Go to Vercel Environment Variables:**
   👉 https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app/settings/environment-variables

2. **Find and delete these variables:**
   - `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_JWT_SECRET`
   - `NEXT_PUBLIC_API_URL` (if it has the same issue)

3. **For each variable:**
   - Click the "..." menu on the right
   - Select "Delete"
   - Confirm deletion

---

### Step 2: Add Variables Correctly (Plain Text Type)

**Now add them again with the correct type:**

#### Variable 1: NEXT_PUBLIC_API_URL

1. Click "Add New" button
2. **Name:** `NEXT_PUBLIC_API_URL`
3. **Value:** `https://ayeshamasood110-todo-backend-api.hf.space`
4. **Type:** Leave as **"Plain Text"** (default - don't change this!)
5. **Environments:** Check all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click "Save"

#### Variable 2: NEXT_PUBLIC_JWT_SECRET

1. Click "Add New" button
2. **Name:** `NEXT_PUBLIC_JWT_SECRET`
3. **Value:** `wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE`
4. **Type:** Leave as **"Plain Text"** (default - don't change this!)
5. **Environments:** Check all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click "Save"

#### Variable 3: BETTER_AUTH_SECRET

1. Click "Add New" button
2. **Name:** `BETTER_AUTH_SECRET`
3. **Value:** `7w0fXuAiEF3Ewg5qzVyu-Z0_WXm9EmutInGbZdPVvf4`
4. **Type:** Leave as **"Plain Text"** (default - don't change this!)
5. **Environments:** Check all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click "Save"

---

### Step 3: Trigger Redeploy

After adding all three variables correctly:

1. Go to: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app
2. Click "Deployments" tab
3. Find the failed deployment (top of list)
4. Click "..." menu → "Redeploy"
5. Confirm redeploy
6. Wait ~2 minutes for deployment to complete

---

## 📋 Important Notes

### About "Plain Text" vs "Secret" Type

**Plain Text (Correct for your case):**
- Value is stored directly in Vercel
- Can be used in environment variables
- This is what you need for JWT secrets

**Secret (What you accidentally selected):**
- References a separate Vercel Secret object
- Requires creating the secret first via CLI or API
- More complex setup, not needed for your use case

### Security Note

Even though we're using "Plain Text" type, your secrets are still secure:
- ✅ Stored encrypted in Vercel's infrastructure
- ✅ Not exposed in client-side code (except NEXT_PUBLIC_* which is intentional)
- ✅ Only accessible to your deployments
- ✅ Not visible in build logs

---

## ✅ Verification Checklist

After completing the steps above:

- [ ] All three variables deleted
- [ ] All three variables re-added as "Plain Text"
- [ ] All three variables have all environments checked
- [ ] Redeploy triggered
- [ ] Deployment shows "Building..." or "Ready"
- [ ] No error messages in deployment logs

---

## 🎯 Expected Result

After successful redeploy:
- ✅ Deployment status: "Ready"
- ✅ No environment variable errors
- ✅ Application loads at: https://todo-full-stack-app-tau.vercel.app
- ✅ JWT authentication works correctly

---

## 🚨 If You Still Get Errors

**Check deployment logs:**
1. Go to failed deployment
2. Click "View Function Logs" or "Build Logs"
3. Look for specific error messages
4. Share the error with me for further debugging

**Common issues:**
- Typo in variable name (must match exactly)
- Typo in variable value (copy-paste to avoid errors)
- Forgot to check all environments
- Didn't trigger redeploy after adding variables

---

## 📞 Need Help?

If you encounter any issues:
1. Take a screenshot of the environment variables page
2. Share the deployment error message
3. I'll help you debug further

---

**Created:** 2026-01-19
**Priority:** 🔴 CRITICAL - Blocks deployment
