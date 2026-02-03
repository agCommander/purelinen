# Fix Connection Timeout - Final Debugging

## The Error

Medusa is trying to connect but timing out after 60 seconds. This suggests PostgreSQL isn't reachable from the application.

## Step-by-Step Debugging

### Step 1: Verify .env File Exists and Has Correct Format

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check .env exists
ls -la .env

# Check DATABASE_URL format (mask password)
cat .env | grep DATABASE_URL | sed 's/:[^@]*@/:****@/'

# Show full .env (be careful - passwords visible)
cat .env
```

### Step 2: Test Connection with Exact .env Values

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Load .env and test
export $(grep DATABASE_URL .env | xargs)
echo "Testing: $(echo $DATABASE_URL | sed 's/:[^@]*@/:****@/')"

# Test connection
timeout 5 psql "$DATABASE_URL" -c "SELECT 1;" 2>&1
```

**If this times out:** The DATABASE_URL is wrong or PostgreSQL isn't accessible
**If this works:** The issue is with how Medusa loads the .env file

### Step 3: Try Different Connection Formats

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test with localhost
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT 1;"

# Test with 127.0.0.1
psql -U medusa_user -d purelinen_medusa -h 127.0.0.1 -c "SELECT 1;"

# Test without -h (uses socket)
psql -U medusa_user -d purelinen_medusa -c "SELECT 1;"
```

### Step 4: Check PostgreSQL is Listening

**In WHM Terminal:**

```bash
# Check what PostgreSQL is listening on
ss -tlnp | grep 5432

# Should show:
# LISTEN 0 244 127.0.0.1:5432
# OR
# LISTEN 0 244 ::1:5432
# OR  
# LISTEN 0 244 0.0.0.0:5432
```

### Step 5: Check PostgreSQL Configuration

**In WHM Terminal:**

```bash
# Check listen_addresses
grep listen_addresses /var/lib/pgsql/15/data/postgresql.conf

# Should be:
# listen_addresses = 'localhost'
# OR
# listen_addresses = '*'
```

### Step 6: Check PostgreSQL Logs

**In WHM Terminal:**

```bash
# Check if PostgreSQL is receiving connection attempts
tail -50 /var/lib/pgsql/15/data/log/postgresql-*.log

# Look for:
# - Connection attempts
# - Authentication failures
# - Timeout errors
```

### Step 7: Test Node.js Connection Directly

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test with Node.js pg library
node -e "
const { Client } = require('pg');
require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND');
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000
});
client.connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT 1');
  })
  .then(() => {
    console.log('✅ Query successful!');
    client.end();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });
"
```

## Common Fixes

### Fix 1: Use 127.0.0.1 Instead of localhost

**Edit .env:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
nano .env
```

Change:
```
DATABASE_URL=postgres://medusa_user:password@127.0.0.1:5432/purelinen_medusa
```

### Fix 2: Check PostgreSQL is Listening on Correct Interface

**In WHM Terminal:**

```bash
# Check listen_addresses
grep listen_addresses /var/lib/pgsql/15/data/postgresql.conf

# If it's not set to 'localhost' or '*', edit it:
nano /var/lib/pgsql/15/data/postgresql.conf

# Set: listen_addresses = 'localhost'
# Save and restart:
systemctl restart postgresql-15
```

### Fix 3: Check pg_hba.conf Allows Connections

**In WHM Terminal:**

```bash
# Check authentication settings
cat /var/lib/pgsql/15/data/pg_hba.conf | grep -v "^#" | grep -v "^$"

# Should have:
# host    all             all             127.0.0.1/32            scram-sha-256
# OR
# host    all             all             127.0.0.1/32            md5
```

### Fix 4: Test with Explicit Connection String

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Try migration with explicit DATABASE_URL
DATABASE_URL="postgres://medusa_user:your_password@127.0.0.1:5432/purelinen_medusa" \
  npx medusa db:migrate
```

## Quick Diagnostic

**Run this in cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

echo "=== 1. .env file ==="
ls -la .env 2>&1

echo -e "\n=== 2. DATABASE_URL ==="
grep DATABASE_URL .env 2>&1 | sed 's/:[^@]*@/:****@/'

echo -e "\n=== 3. Test psql localhost ==="
timeout 3 psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT 1;" 2>&1 | head -3

echo -e "\n=== 4. Test psql 127.0.0.1 ==="
timeout 3 psql -U medusa_user -d purelinen_medusa -h 127.0.0.1 -c "SELECT 1;" 2>&1 | head -3

echo -e "\n=== 5. Test with .env value ==="
export $(grep DATABASE_URL .env | xargs) 2>/dev/null
timeout 3 psql "$DATABASE_URL" -c "SELECT 1;" 2>&1 | head -3
```

Run this diagnostic and share the output - it will show exactly where the connection is failing!
