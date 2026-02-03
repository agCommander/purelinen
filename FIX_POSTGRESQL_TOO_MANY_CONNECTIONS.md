# Fix "Too Many Clients Already" Error

## The Problem

PostgreSQL has reached its maximum connection limit. This happens when:
- Too many idle connections
- Max connections setting is too low
- Connections aren't being closed properly

## Quick Fixes

### Fix 1: Kill Idle Connections

**On server:**

```bash
# Connect as postgres superuser
sudo -u postgres psql

# Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'purelinen_medusa' 
  AND state = 'idle' 
  AND state_change < now() - interval '5 minutes';

# Check current connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'purelinen_medusa';

# Exit
\q
```

### Fix 2: Increase Max Connections

**On server:**

```bash
# Edit PostgreSQL config
sudo nano /var/lib/pgsql/15/data/postgresql.conf

# Find max_connections (usually around line 100)
# Change from default (usually 100) to:
max_connections = 200

# Save and restart PostgreSQL
sudo systemctl restart postgresql-15
```

### Fix 3: Check Current Connections

**On server:**

```bash
# See how many connections are active
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# See connections per database
sudo -u postgres psql -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# See idle connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';"
```

## Immediate Solution

**Kill idle connections and try again:**

```bash
# On server - kill idle connections
sudo -u postgres psql << EOF
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
  AND pid <> pg_backend_pid();
EOF

# Then try migration again
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
npx medusa db:migrate
```

## Check What's Using Connections

**On server:**

```bash
# See all active connections
sudo -u postgres psql -c "
SELECT 
  pid,
  usename,
  datname,
  state,
  query_start,
  state_change,
  now() - state_change AS idle_duration
FROM pg_stat_activity 
WHERE datname = 'purelinen_medusa'
ORDER BY state_change;
"
```

## Permanent Fix

**Increase max_connections in postgresql.conf:**

```bash
# Edit config
sudo nano /var/lib/pgsql/15/data/postgresql.conf

# Find and change:
max_connections = 200

# Also increase shared_buffers (should be ~25% of max_connections)
shared_buffers = 50MB

# Restart PostgreSQL
sudo systemctl restart postgresql-15
```

## Quick Command to Free Up Connections

**Run this to kill idle connections:**

```bash
sudo -u postgres psql -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'purelinen_medusa' 
  AND state = 'idle' 
  AND state_change < now() - interval '1 minute'
  AND pid <> pg_backend_pid();
"
```

Then try your migration again!
