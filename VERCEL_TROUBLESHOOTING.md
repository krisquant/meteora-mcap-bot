# Vercel Deployment Troubleshooting

## Issue: "Nothing happens when I press deploy button"

### Step 1: Check Prerequisites

1. **Is your code pushed to GitHub?**
   ```bash
   git status
   git push -u origin main
   ```
   Vercel needs your code to be on GitHub first.

2. **Are you logged into Vercel?**
   - Go to [vercel.com](https://vercel.com)
   - Make sure you're signed in
   - Try refreshing the page

### Step 2: Try Manual Import

Instead of using the deploy button, try:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try clicking deploy again
4. Look for any JavaScript errors

### Step 4: Check Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Check if there are any failed deployments
3. Look for error messages

### Step 5: Verify Repository Access

1. Make sure Vercel has access to your GitHub account
2. Go to Vercel Settings → Git
3. Verify your GitHub connection

### Step 6: Try CLI Deployment

If the web UI doesn't work, try CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Step 7: Check for Build Errors

After deployment starts, check:

1. Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check "Build Logs" for errors

### Common Build Errors:

**Error: Cannot find module**
- Make sure `node_modules` is in `.gitignore`
- Vercel will install dependencies automatically

**Error: Import/Export issues**
- Check that `package.json` has `"type": "module"` (it does)

**Error: API route not found**
- Make sure `api/webhook.js` exists
- Check file structure matches

### Step 8: Manual Webhook Setup

If deployment succeeds but bot doesn't work:

1. Get your Vercel URL: `https://your-project.vercel.app`
2. Set environment variable: `WEBHOOK_URL=https://your-project.vercel.app`
3. Redeploy
4. Or manually set webhook:
   ```bash
   node scripts/set-webhook.js https://your-project.vercel.app
   ```

## Still Not Working?

1. **Check Vercel Status**: [status.vercel.com](https://status.vercel.com)
2. **Try a different browser**
3. **Clear browser cache**
4. **Contact Vercel support** with your deployment logs

