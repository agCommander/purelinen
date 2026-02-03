# Debug Medusa Database Connection Timeout

## The Problem

Even after freeing connections, Medusa still times out. This suggests a connection configuration issue, not just too many connections.

## Step-by-Step Debugging

### Step 1: Verify .env File is Being Read

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check .env exists and has DATABASE_URL
ls -la .env
cat .env | grep DATABASE_URL

# Check format - should be:
# DATABASE_URL=postgres://medusa_user:password@localhost:5432/purelinen_medusa
```

### Step 2: Test Connection with Exact .env Values

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Extract DATABASE_URL from .env
export $(grep DATABASE_URL .env | xargs)

# Test connection using same format Medusa uses
psql "$DATABASE_URL" -c "SELECT 1;"
```

If this fails, the DATABASE_URL is wrong.

### Step 3: Check PostgreSQL is Listening

**In WHM Terminal:**

```bash
# Check what PostgreSQL is listening on
ss -tlnp | grep 5432

# Should show:
# LISTEN 0 244 127.0.0.1:5432
# OR
# LISTEN 0 244 ::1:5432
```

### Step 4: Test Connection from Application Directory

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test basic connection
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT 1;"

# If this works, PostgreSQL is fine
# If this fails, check credentials
```

### Step 5: Check Medusa Config Loading

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check if medusa-config.ts can load
node -e "require('./medusa-config.ts')"

# Or check environment loading
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

## Common Issues

### Issue 1: Wrong DATABASE_URL Format

**Check your .env:**

```bash
cat .env | grep DATABASE_URL
```

**Correct format:**
```
DATABASE_URL=postgres://username:password@host:port/database
```

**Common mistakes:**
- Missing `postgres://` prefix
- Wrong port (should be `5432`)
- Special characters in password not URL-encoded
- Using `127.0.0.1` instead of `localhost` (try `localhost`)

### Issue 2: Password with Special Characters

If password has `@`, `#`, `%`, etc., they need URL encoding:

```bash
# Example: password is "my@pass#123"
# In DATABASE_URL: "my%40pass%23123"
# @ = %40
# # = %23
# % = %25
```

### Issue 3: .env File Not in Right Location

**Make sure .env is here:**
```
/home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen/.env
```

### Issue 4: Try Explicit DATABASE_URL

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Run migration with explicit DATABASE_URL
DATABASE_URL="postgres://medusa_user:your_password@localhost:5432/purelinen_medusa" \
  npx medusa db:migrate
```

## Quick Diagnostic Script

**Run this in cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

echo "=== .env DATABASE_URL ==="
grep DATABASE_URL .env | sed 's/:.*@/:****@/'

echo -e "\n=== Testing Connection ==="
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT 1;" 2>&1

echo -e "\n=== Testing with .env value ==="
export $(grep DATABASE_URL .env | xargs)
psql "$DATABASE_URL" -c "SELECT 1;" 2>&1
```

## Most Likely Fix

**Check your DATABASE_URL format:**

```bash
# In cPanel Terminal
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
cat .env | grep DATABASE_URL
```

**Make sure it's exactly:**
```
DATABASE_URL=postgres://medusa_user:password@localhost:5432/purelinen_medusa
```

**Then try migration with explicit variable:**

```bash
export $(grep DATABASE_URL .env | xargs)
npx medusa db:migrate
```

## Alternative: Check PostgreSQL Logs

**In WHM Terminal:**

```bash
# Check PostgreSQL logs for connection attempts
tail -50 /var/lib/pgsql/15/data/log/postgresql-*.log

# Or systemd logs
journalctl -u postgresql-15 -n 50
```

This will show if PostgreSQL is receiving connection attempts and why they're failing.

Run the diagnostic script above and share the output - that will tell us exactly what's wrong!
