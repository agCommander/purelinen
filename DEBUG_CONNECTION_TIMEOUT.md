# Debug Medusa Connection Timeout

## Current Status
- ✅ PostgreSQL is running
- ✅ Only 6 connections (not overloaded)
- ❌ Medusa migration still timing out

## Step-by-Step Debugging

### Step 1: Check .env File Location and Content

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Verify .env exists
ls -la .env

# Show DATABASE_URL (password will be visible - be careful!)
cat .env | grep DATABASE_URL

# Check entire .env file
cat .env
```

### Step 2: Test Manual Connection with Exact Credentials

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Get DATABASE_URL from .env
export $(grep DATABASE_URL .env | xargs)

# Test connection
echo "Testing: $DATABASE_URL"
psql "$DATABASE_URL" -c "SELECT 1;" -t
```

**If this works:** The credentials are correct, issue is with Medusa
**If this fails:** The DATABASE_URL is wrong

### Step 3: Test Basic psql Connection

**In cPanel Terminal:**

```bash
# Test basic connection (you'll be prompted for password)
psql -U medusa_user -d purelinen_medusa -h localhost

# If it connects, credentials work
# Type \q to exit
```

### Step 4: Check PostgreSQL is Listening Correctly

**In WHM Terminal:**

```bash
# Check what PostgreSQL is listening on
ss -tlnp | grep 5432

# Should show something like:
# LISTEN 0 244 127.0.0.1:5432 0.0.0.0:*
```

### Step 5: Check PostgreSQL Logs for Connection Attempts

**In WHM Terminal:**

```bash
# Check recent PostgreSQL logs
tail -100 /var/lib/pgsql/15/data/log/postgresql-*.log | grep -i "medusa\|connection\|timeout"

# Or check systemd logs
journalctl -u postgresql-15 -n 100 | grep -i "connection\|timeout"
```

### Step 6: Try Migration with Explicit DATABASE_URL

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Get the DATABASE_URL from .env
DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)

# Try migration with explicit variable
DATABASE_URL="$DATABASE_URL" npx medusa db:migrate
```

### Step 7: Check Node.js Can Reach PostgreSQL

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test with Node.js directly
node -e "
const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => {
    console.log('✅ Connected!');
    return client.query('SELECT 1');
  })
  .then(() => {
    console.log('✅ Query successful!');
    client.end();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"
```

## Most Likely Issues

### Issue 1: Wrong DATABASE_URL Format

**Check format:**
```
✅ Correct: DATABASE_URL=postgres://user:pass@localhost:5432/dbname
❌ Wrong:   DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
❌ Wrong:   DATABASE_URL=user:pass@localhost:5432/dbname
```

### Issue 2: Password Has Special Characters

If password has `@`, `#`, `%`, etc., URL encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

### Issue 3: Wrong Database Name

WHM might have created: `purelinen_purelinen_medusa` instead of `purelinen_medusa`

**Check actual database name:**

**In WHM Terminal:**
```bash
su - postgres
psql -c "\l" | grep purelinen
exit
```

### Issue 4: .env File Not Being Read

**Test if .env is loaded:**

**In cPanel Terminal:**
```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check if dotenv can read it
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND');"
```

## Quick Diagnostic Script

**Run this in cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

echo "=== 1. Check .env exists ==="
ls -la .env

echo -e "\n=== 2. DATABASE_URL (masked) ==="
grep DATABASE_URL .env | sed 's/:[^@]*@/:****@/'

echo -e "\n=== 3. Test manual psql ==="
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT 1;" 2>&1 | head -3

echo -e "\n=== 4. Test with .env value ==="
export $(grep DATABASE_URL .env | xargs)
psql "$DATABASE_URL" -c "SELECT 1;" 2>&1 | head -3

echo -e "\n=== 5. Check Node.js connection ==="
node -e "
const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => { console.log('✅ Node.js can connect!'); client.end(); })
  .catch(err => { console.error('❌ Node.js error:', err.message); });
" 2>&1
```

## What to Share

Run the diagnostic script above and share:
1. What the DATABASE_URL shows (masked)
2. Whether manual `psql` works
3. Whether Node.js test works
4. Any error messages

This will pinpoint the exact issue!
