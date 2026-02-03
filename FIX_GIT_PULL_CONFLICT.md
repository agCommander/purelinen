# Fix Git Pull Conflict - Untracked Files

## The Problem

Git is refusing to pull because there are untracked files on the server that would be overwritten. These files exist on the server but aren't in your git repository.

## Solution Options

### Option 1: Backup and Remove Untracked Files (Recommended)

If these files aren't important or are duplicates:

```bash
# In cPanel Terminal
cd /home/purelinen/public_html/subdomains/newpl

# Create a backup directory
mkdir -p ../backup_untracked_files

# Move untracked files to backup
# (Git will tell us which files are the problem)
git status

# Remove the untracked files that conflict
# Be careful - only remove files that are duplicates or not needed
rm -rf ASSIGN_CUSTOMER_TO_GROUP.md
rm -rf B2B_REGISTRATION_FLOW.md
# ... etc for all conflicting files

# Or move them all to backup
git status --porcelain | grep '^??' | awk '{print $2}' | xargs -I {} mv {} ../backup_untracked_files/

# Then pull
git pull origin main
```

### Option 2: Add Files to Git (If They Should Be Tracked)

If these files should be in git:

```bash
cd /home/purelinen/public_html/subdomains/newpl

# Add all untracked files
git add .

# Commit them
git commit -m "Add untracked files from server"

# Push to GitHub
git push origin main

# Then pull should work
git pull origin main
```

### Option 3: Force Pull (Overwrite Local Files)

**⚠️ Warning: This will overwrite local files with GitHub version**

```bash
cd /home/purelinen/public_html/subdomains/newpl

# Reset to match GitHub exactly
git fetch origin
git reset --hard origin/main

# This will remove any local changes/untracked files
```

### Option 4: Stash and Pull

```bash
cd /home/purelinen/public_html/subdomains/newpl

# Stash untracked files
git stash --include-untracked

# Pull
git pull origin main

# If you need the stashed files later:
# git stash pop
```

## Recommended: Quick Fix

Since these look like documentation files that should be in git:

```bash
# In cPanel Terminal
cd /home/purelinen/public_html/subdomains/newpl

# Check what's different
git status

# Add all files to git
git add .

# Commit
git commit -m "Add server files to repository"

# Push to GitHub
git push origin main

# Now pull should work
git pull origin main
```

## Update Workflow to Handle This

We can also update the workflow to handle this automatically:

```yaml
script: |
  cd /home/purelinen/public_html/subdomains/newpl
  
  # Stash any local changes
  git stash --include-untracked || true
  
  # Pull latest code
  git pull origin main || git reset --hard origin/main
  
  # Rest of deployment...
```
