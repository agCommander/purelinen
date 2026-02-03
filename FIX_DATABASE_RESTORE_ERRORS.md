# Fix Database Restore Errors

## The Errors Explained

1. **"relation does not exist"** - Tables haven't been created yet (need to run migrations first)
2. **"role rogerwiese does not exist"** - Your local database user doesn't exist on server (safe to ignore)

## Solution 1: Run Migrations First, Then Restore Data Only (Recommended)

### Step 1: Run Medusa Migrations

**On server (cPanel Terminal):**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Run migrations to create all tables
npx medusa db:migrate

# Or if that doesn't work:
npm run build
npm run start
# Wait for migrations, then Ctrl+C
```

### Step 2: Restore Data Only (Skip Schema)

**Create a data-only backup on your local machine:**

```bash
# On your local machine - create data-only backup
/usr/local/opt/postgresql@15/bin/pg_dump -U medusa_user -d purelinen_medusa -h localhost \
  --data-only --no-owner --no-privileges > local_data_only.sql
```

**Then restore on server:**

```bash
# On server
cd /home/purelinen
psql -U medusa_user -d purelinen_medusa -h localhost < local_data_only.sql
```

## Solution 2: Restore with --no-owner Flag (Easier)

**On server, restore ignoring ownership:**

```bash
# If you have pg_restore (for custom format)
pg_restore -U medusa_user -d purelinen_medusa -h localhost --no-owner --no-privileges local_backup.dump

# Or restore SQL dump ignoring errors
psql -U medusa_user -d purelinen_medusa -h localhost < local_backup.sql 2>&1 | grep -v "ERROR.*does not exist" | grep -v "role.*does not exist"
```

## Solution 3: Clean Restore (Drops Existing Tables)

**⚠️ WARNING: This will delete existing data!**

```bash
# On server - drop and recreate schema
psql -U medusa_user -d purelinen_medusa -h localhost << EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO medusa_user;
GRANT ALL ON SCHEMA public TO public;
EOF

# Then restore
psql -U medusa_user -d purelinen_medusa -h localhost < local_backup.sql
```

## Solution 4: Filter Out Errors (Quick Fix)

**Restore but ignore the errors:**

```bash
# On server
cd /home/purelinen

# Restore and filter out common errors
psql -U medusa_user -d purelinen_medusa -h localhost < local_backup.sql 2>&1 | \
  grep -v "ERROR.*does not exist" | \
  grep -v "role.*does not exist" | \
  grep -v "WARNING.*no privileges"

# Check if data was restored despite errors
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT COUNT(*) FROM product;"
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT COUNT(*) FROM customer;"
```

## Recommended Approach

**Best method for your situation:**

### Step 1: Run Migrations on Server

```bash
# On server - cPanel Terminal
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Make sure .env is configured
ls -la .env

# Run migrations
npx medusa db:migrate
```

### Step 2: Create Data-Only Backup Locally

**On your local machine:**

```bash
# Create data-only backup (no schema, no ownership)
/usr/local/opt/postgresql@15/bin/pg_dump -U medusa_user -d purelinen_medusa -h localhost \
  --data-only \
  --no-owner \
  --no-privileges \
  --column-inserts \
  > local_data_only.sql
```

### Step 3: Upload and Restore Data

1. Upload `local_data_only.sql` via cPanel File Manager to `/home/purelinen/`
2. Restore on server:

```bash
# On server
cd /home/purelinen
psql -U medusa_user -d purelinen_medusa -h localhost < local_data_only.sql
```

## Check What Was Restored

```bash
# On server - verify data
psql -U medusa_user -d purelinen_medusa -h localhost << EOF
\dt
SELECT COUNT(*) as product_count FROM product;
SELECT COUNT(*) as customer_count FROM customer;
SELECT COUNT(*) as order_count FROM "order";
EOF
```

## Common Issues

### Missing Tables After Restore

If tables are missing, run migrations:
```bash
npx medusa db:migrate
```

### Data Not Showing

Check if data was actually restored:
```bash
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT COUNT(*) FROM product;"
```

If count is 0, the data restore didn't work. Try Solution 1 (data-only restore).

### Permission Errors

If you get permission errors:
```bash
# Grant permissions
sudo -u postgres psql -d purelinen_medusa << EOF
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medusa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medusa_user;
EOF
```

## Quick Fix Right Now

**If you just want to ignore the errors and see if data restored:**

```bash
# On server
cd /home/purelinen

# Restore (errors about missing roles/tables are OK if migrations ran)
psql -U medusa_user -d purelinen_medusa -h localhost < local_backup.sql 2>&1 | \
  grep -v "ERROR.*role.*does not exist" | \
  grep -v "ERROR.*relation.*does not exist"

# Then check if data is there
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT COUNT(*) FROM product;"
```

The errors about "rogerwiese" role are safe to ignore - that's just your local username. The important thing is whether your data (products, customers, etc.) was restored.
