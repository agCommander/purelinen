# Fix Admin Build Location

## The Problem

Build output is in `.medusa/client/index.html` but Medusa is looking for `.medusa/admin/index.html`.

## Solution 1: Check Build Structure

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check what's in .medusa
ls -la .medusa/
ls -la .medusa/client/
ls -la .medusa/admin/ 2>&1

# Check if we need to move or rebuild
```

## Solution 2: Rebuild Properly

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Stop PM2
pm2 stop purelinen-backend

# Clean build
rm -rf .medusa

# Set DATABASE_URL
export DATABASE_URL="postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa"

# Rebuild
npm run build

# Check where files ended up
ls -la .medusa/
ls -la .medusa/admin/ 2>&1
ls -la .medusa/client/ 2>&1
```

## Solution 3: Create Symlink (Quick Fix)

**If admin files are in client directory:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Create admin directory if it doesn't exist
mkdir -p .medusa/admin

# Copy or symlink files
cp -r .medusa/client/* .medusa/admin/ 2>/dev/null || ln -s ../client .medusa/admin

# Verify
ls -la .medusa/admin/index.html
```

## Solution 4: Check Medusa Config

The issue might be in how Medusa is configured. Check if there's a config pointing to the wrong directory.

Run Solution 2 first (rebuild) - that should put files in the right place!
