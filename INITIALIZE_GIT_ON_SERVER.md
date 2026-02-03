# Initialize Git on Server - Step by Step

## Option 1: Clone Entire Repo (Recommended)

This matches your GitHub repo structure and is cleaner for future deployments.

### Step 1: Choose a Location

**Recommended location:** `/home/purelinen/purelinen_website/`

This keeps your code outside of `public_html` (which is better for security).

### Step 2: Clone the Repository

```bash
# SSH into your server
ssh purelinen@your-server-ip

# Navigate to home directory
cd /home/purelinen

# Clone the entire repository
git clone git@github.com:agCommander/purelinen.git

# This creates: /home/purelinen/purelinen_website/
# With structure:
#   purelinen_website/
#     ├── medusa-backend/
#     │   └── purelinen/
#     ├── medusa-storefront/
#     └── ...
```

### Step 3: Move Your Current Code (If Needed)

If you have code at `/home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen/`:

```bash
# Copy your .env file (important!)
cp /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen/.env \
   /home/purelinen/purelinen_website/medusa-backend/purelinen/.env

# Copy any other custom files if needed
# Then you can remove the old location later
```

### Step 4: Update Deployment Workflow Path

Update `.github/workflows/deploy-backend.yml` to use the new path:

```yaml
script: |
  cd /home/purelinen/purelinen_website/medusa-backend/purelinen
  
  # Pull latest code
  git pull origin main
  # ... rest of script
```

### Step 5: Update PM2

```bash
# Stop PM2
pm2 stop purelinen-backend
pm2 delete purelinen-backend

# Navigate to new location
cd /home/purelinen/purelinen_website/medusa-backend/purelinen

# Start PM2 from new location
pm2 start ecosystem.config.js
pm2 save
```

## Option 2: Initialize Git in Current Location

If you want to keep your code where it is:

### Step 1: Initialize Git in Backend Folder

```bash
# SSH into server
ssh purelinen@your-server-ip

# Navigate to backend directory
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Initialize git
git init

# Add remote (pointing to your repo, but only backend folder)
git remote add origin git@github.com:agCommander/purelinen.git

# Create a sparse checkout to only get the backend folder
git config core.sparseCheckout true
echo "medusa-backend/purelinen/*" > .git/info/sparse-checkout

# Pull only the backend folder
git pull origin main
```



**Note:** This is more complex and the workflow would need to be adjusted.

## Option 3: Initialize at Root of Current Structure

If your server structure matches the repo structure:

```bash
# Navigate to where your project root should be
cd /home/purelinen/public_html/subdomains/newpl

# Initialize git
git init

# Add remote
git remote add origin git@github.com:agCommander/purelinen.git

# Pull code
git pull origin main
```

Then backend would be at: `/home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen/`

## Recommended Approach

**I recommend Option 1** - Clone the entire repo to `/home/purelinen/purelinen_website/`:

### Complete Setup:

```bash
# 1. Clone repo
cd /home/purelinen
git clone git@github.com:agCommander/purelinen.git purelinen_website

# 2. Copy your .env file
cp /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen/.env \
   /home/purelinen/purelinen_website/medusa-backend/purelinen/.env

# 3. Install dependencies
cd /home/purelinen/purelinen_website/medusa-backend/purelinen
npm install --legacy-peer-deps

# 4. Build
npm run build

# 5. Update PM2
pm2 stop purelinen-backend
pm2 delete purelinen-backend
cd /home/purelinen/purelinen_website/medusa-backend/purelinen
pm2 start ecosystem.config.js
pm2 save

# 6. Update workflow path (in GitHub repo)
# Change: cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
# To:     cd /home/purelinen/purelinen_website/medusa-backend/purelinen
```

## Update GitHub Workflow

After choosing your location, update `.github/workflows/deploy-backend.yml`:

**If using Option 1 (recommended):**
```yaml
script: |
  cd /home/purelinen/purelinen_website/medusa-backend/purelinen
  git pull origin main
  # ... rest
```

**If keeping current location:**
```yaml
script: |
  cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
  git pull origin main
  # ... rest
```

## Verify Setup

```bash
# Check git is initialized
cd /path/to/your/backend
git status

# Check remote is set
git remote -v

# Test pull
git pull origin main
```

## Summary

**Answer: Initialize Git at the ROOT folder** (where your entire project structure is)

- Your GitHub repo has: `medusa-backend/purelinen/`, `medusa-storefront/`, etc.
- So initialize git where that structure matches
- Recommended: `/home/purelinen/purelinen_website/` (clone entire repo)
- Then backend is at: `/home/purelinen/purelinen_website/medusa-backend/purelinen/`

This way:
- ✅ Matches your GitHub repo structure
- ✅ Easier to manage
- ✅ Can deploy storefronts from same repo later
- ✅ Cleaner organization
