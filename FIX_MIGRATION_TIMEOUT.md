# Fix Migration Timeout - PostgreSQL Connection Issues

## The Problem

Migrations are timing out when trying to connect to PostgreSQL. This usually means:
- PostgreSQL isn't running
- Wrong connection string in `.env`
- PostgreSQL not accessible from the application
- Firewall blocking connection

## Step-by-Step Troubleshooting

### Step 1: Check PostgreSQL is Running

**On server:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql-15

# If not running, start it
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

### Step 2: Test Database Connection Manually

**On server:**

```bash
# Test connection with same credentials from .env
psql -U medusa_user -d purelinen_medusa -h localhost

# If that works, PostgreSQL is fine
# If that fails, check credentials
```

### Step 3: Check .env File

**On server:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Should be something like:
# DATABASE_URL=postgres://medusa_user:password@localhost:5432/purelinen_medusa
```

### Step 4: Verify PostgreSQL is Listening

**On server:**

```bash
# Check if PostgreSQL is listening on port 5432
sudo netstat -tlnp | grep 5432
# OR
sudo ss -tlnp | grep 5432

# Should show PostgreSQL listening on localhost:5432
```

### Step 5: Check PostgreSQL Configuration

**On server:**

```bash
# Check postgresql.conf
sudo cat /var/lib/pgsql/15/data/postgresql.conf | grep listen_addresses

# Should be:
# listen_addresses = 'localhost'
# OR
# listen_addresses = '*'
```

### Step 6: Check pg_hba.conf

**On server:**

```bash
# Check authentication settings
sudo cat /var/lib/pgsql/15/data/pg_hba.conf | grep -v "^#" | grep -v "^$"

# Should have a line like:
# host    all             all             127.0.0.1/32            scram-sha-256
# OR
# host    all             all             127.0.0.1/32            md5
```

## Common Fixes

### Fix 1: PostgreSQL Not Running

```bash
# Start PostgreSQL
sudo systemctl start postgresql-15

# Verify it's running
sudo systemctl status postgresql-15
```

### Fix 2: Wrong DATABASE_URL Format

**Check your .env file:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
nano .env
```

**Correct format:**
```env
DATABASE_URL=postgres://medusa_user:your_password@localhost:5432/purelinen_medusa
```

**Common mistakes:**
- ❌ Missing password
- ❌ Wrong username
- ❌ Wrong database name
- ❌ Using `127.0.0.1` instead of `localhost` (should work, but try `localhost`)
- ❌ Wrong port (should be `5432`)

### Fix 3: PostgreSQL Not Listening

**If PostgreSQL isn't listening:**

```bash
# Edit postgresql.conf
sudo nano /var/lib/pgsql/15/data/postgresql.conf

# Find and set:
listen_addresses = 'localhost'

# Restart PostgreSQL
sudo systemctl restart postgresql-15
```

### Fix 4: Authentication Issues

**If connection fails due to authentication:**

```bash
# Check pg_hba.conf
sudo nano /var/lib/pgsql/15/data/pg_hba.conf

# Make sure you have:
host    all             all             127.0.0.1/32            scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql-15
```

### Fix 5: Test Connection with Exact .env Credentials

**On server:**

```bash
# Get DATABASE_URL from .env
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
source .env 2>/dev/null || true

# Extract components
# DATABASE_URL format: postgres://user:pass@host:port/dbname

# Test with psql using same format
psql "$DATABASE_URL" -c "SELECT 1;"
```

## Quick Diagnostic Commands

**Run these on server to diagnose:**

```bash
# 1. Check PostgreSQL status
sudo systemctl status postgresql-15

# 2. Test basic connection
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT 1;"

# 3. Check .env file
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
cat .env | grep DATABASE_URL

# 4. Check if port is listening
sudo ss -tlnp | grep 5432

# 5. Check PostgreSQL logs
sudo tail -50 /var/lib/pgsql/15/data/log/postgresql-*.log
```

## Alternative: Use Connection String Directly

**If .env isn't being read:**

```bash
# Run migration with explicit DATABASE_URL
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

DATABASE_URL="postgres://medusa_user:your_password@localhost:5432/purelinen_medusa" \
  npx medusa db:migrate
```

## Check PostgreSQL Logs

**On server:**

```bash
# View recent PostgreSQL logs
sudo tail -100 /var/lib/pgsql/15/data/log/postgresql-*.log

# Or check systemd logs
sudo journalctl -u postgresql-15 -n 50
```

This will show connection attempts and any errors.

## Most Likely Issues

1. **PostgreSQL not running** - Check with `systemctl status`
2. **Wrong password in .env** - Verify DATABASE_URL
3. **PostgreSQL not listening** - Check `listen_addresses`
4. **Authentication method** - Check `pg_hba.conf`

Run the diagnostic commands above and share the results - that will tell us exactly what's wrong!
