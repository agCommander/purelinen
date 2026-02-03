# Troubleshooting Automated Deployment

## Issue: Changes pushed to GitHub but not on server

### Step 1: Check if GitHub Actions Ran

1. Go to your GitHub repo: https://github.com/agCommander/purelinen
2. Click the **Actions** tab
3. Look for the latest workflow run
4. Check if it:
   - ✅ Completed successfully (green checkmark)
   - ❌ Failed (red X)
   - ⏳ Still running (yellow circle)

### Step 2: Check Where Git is Initialized

**In cPanel Terminal, check:**

```bash
# Check where git is initialized
cd /home/purelinen/public_html/subdomains/newpl
git status

# If that works, git is at the root level
# If not, try:
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
git status
```

### Step 3: Fix the Workflow Path

**If git is at the root** (`/home/purelinen/public_html/subdomains/newpl/`), the workflow needs to:

1. Pull from root
2. Then cd into backend folder

**Updated workflow should be:**

```yaml
script: |
  # Pull from root where git is initialized
  cd /home/purelinen/public_html/subdomains/newpl
  git pull origin main
  
  # Then go to backend directory
  cd medusa-backend/purelinen
  
  # Install dependencies
  npm install --legacy-peer-deps
  
  # Build application
  npm run build
  
  # Restart PM2
  pm2 restart purelinen-backend || pm2 start ecosystem.config.js
  
  # Save PM2 config
  pm2 save
```

### Step 4: Manual Test (Verify Git Works)

**In cPanel Terminal:**

```bash
# Navigate to where git is initialized
cd /home/purelinen/public_html/subdomains/newpl

# Pull manually to test
git pull origin main

# Check if files updated
ls -la
```

### Step 5: Check GitHub Actions Logs

If the workflow ran but failed:

1. Go to GitHub → **Actions** tab
2. Click on the failed workflow run
3. Click on the **"Deploy to server via SSH"** step
4. Look for error messages

**Common errors:**
- "Permission denied" → SSH key issue
- "git: command not found" → Git not installed on server
- "cd: no such file or directory" → Wrong path
- "npm: command not found" → Node.js/npm not in PATH

## Quick Fix: Test Manual Pull First

**In cPanel Terminal:**

```bash
# Go to root where git is
cd /home/purelinen/public_html/subdomains/newpl

# Pull latest
git pull origin main

# Verify files updated
ls -la

# If that works, the issue is with GitHub Actions workflow
# If that fails, the issue is with git setup on server
```

## Common Issues & Solutions

### Issue: Git is at root, but workflow tries to pull from subdirectory

**Solution:** Update workflow to pull from root first

### Issue: GitHub Actions can't connect via SSH

**Solution:** 
- Check SSH secrets are correct
- Test SSH connection manually
- Verify SSH key is in `~/.ssh/authorized_keys` on server

### Issue: Workflow runs but git pull fails

**Solution:**
- Check git remote is set correctly
- Verify branch name matches (main vs master)
- Check file permissions

### Issue: Workflow succeeds but files don't update

**Solution:**
- Check if workflow is pulling to correct directory
- Verify git is initialized where workflow expects
- Check for file permission issues
