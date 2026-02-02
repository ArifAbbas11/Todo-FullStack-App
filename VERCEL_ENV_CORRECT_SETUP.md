# Vercel Environment Variables - Correct Setup Instructions

**Error:** `Environment Variable "BETTER_AUTH_SECRET" references Secret "better-auth-secret", which does not exist.`

**Root Cause:** The variable is trying to reference a Vercel Secret object instead of containing the actual value.

---

## ✅ Correct Setup (Actual Vercel UI)

### Step 1: Delete Existing Variables

Go to: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app/settings/environment-variables

**Delete these variables:**
- Find `BETTER_AUTH_SECRET` → Click "..." → Delete
- Find `NEXT_PUBLIC_JWT_SECRET` → Click "..." → Delete
- Find `NEXT_PUBLIC_API_URL` → Click "..." → Delete (if it exists)

---

### Step 2: Add Variables Correctly

The Vercel UI looks like this when you click "Add New":

```
┌─────────────────────────────────────────┐
│ Key                                     │
│ [Enter variable name]                   │
│                                         │
│ Value                                   │
│ [Enter variable value]                  │
│                                         │
│ Environments                            │
│ ☐ Production                            │
│ ☐ Preview                               │
│ ☐ Development                           │
│                                         │
│ [Cancel]  [Save]                        │
└─────────────────────────────────────────┘
```

**IMPORTANT:** Just enter the actual value directly in the "Value" field. Don't use any special syntax like `@secret-name` or reference anything.

---

### Add Each Variable:

#### Variable 1: NEXT_PUBLIC_API_URL

1. Click "Add New"
2. **Key:** `NEXT_PUBLIC_API_URL`
3. **Value:** `https://ayeshamasood110-todo-backend-api.hf.space`
   - ⚠️ Paste the full URL directly
   - ⚠️ Don't add quotes or any special characters
4. **Environments:** Check ALL three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click "Save"

#### Variable 2: NEXT_PUBLIC_JWT_SECRET

1. Click "Add New"
2. **Key:** `NEXT_PUBLIC_JWT_SECRET`
3. **Value:** `wLFofcYCvjOsoacjo4R-EGDJplH0uHIGW3uoanwFlIE`
   - ⚠️ Copy and paste this exact value
   - ⚠️ No quotes, no spaces, just the value
4. **Environments:** Check ALL three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click "Save"

#### Variable 3: BETTER_AUTH_SECRET

1. Click "Add New"
2. **Key:** `BETTER_AUTH_SECRET`
3. **Value:** `7w0fXuAiEF3Ewg5qzVyu-Z0_WXm9EmutInGbZdPVvf4`
   - ⚠️ Copy and paste this exact value
   - ⚠️ No quotes, no spaces, just the value
4. **Environments:** Check ALL three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click "Save"

---

## ⚠️ Common Mistakes to Avoid

**DON'T do these:**
- ❌ Don't use `@better-auth-secret` (this references a Secret object)
- ❌ Don't use `${BETTER_AUTH_SECRET}` (this is variable substitution)
- ❌ Don't add quotes around the value: `"value"` (just paste the raw value)
- ❌ Don't check any "Sensitive" checkbox if you see one (unless you want the value hidden)

**DO this:**
- ✅ Paste the actual secret value directly
- ✅ Check all three environment boxes
- ✅ Use the exact key names shown above

---

## 🔍 What Went Wrong?

The error message `references Secret "better-auth-secret"` means Vercel thinks you're trying to use a **Vercel Secret** (a separate feature) instead of a regular environment variable.

**Vercel Secrets** are created separately via CLI:
```bash
vercel secrets add better-auth-secret "value"
```

Then referenced in environment variables using:
```
@better-auth-secret
```

**But you don't need Secrets!** Just use regular environment variables with the actual values.

---

## 🚀 Step 3: Redeploy

After adding all three variables:

1. Go to: https://vercel.com/arif-abbas-projects-2ad27cc0/todo-full-stack-app
2. Click "Deployments" tab
3. Find the latest (failed) deployment
4. Click "..." menu → "Redeploy"
5. Confirm
6. Wait ~2 minutes

---

## ✅ Verification

After redeploy completes, check:
- Deployment status shows "Ready" (not "Error")
- No error messages about missing secrets
- Application loads at: https://todo-full-stack-app-tau.vercel.app

---

## 📸 Visual Guide

When you're on the "Add New" screen, it should look like this:

```
Key: NEXT_PUBLIC_API_URL
Value: https://ayeshamasood110-todo-backend-api.hf.space

Environments:
✅ Production
✅ Preview
✅ Development

[Cancel] [Save]
```

**The value field should contain the actual URL/secret, not a reference to anything else.**

---

**Created:** 2026-01-19
**Status:** Corrected Instructions
