# Database Migration Guide - Local to Production

## Overview

This guide covers migrating your local PostgreSQL database to the production server.

## Prerequisites

- ✅ PostgreSQL installed on both local and server
- ✅ Database created on server (`purelinen_medusa`)
- ✅ Server database user has proper permissions
- ✅ SSH access to server

## Method 1: Using pg_dump and psql (Recommended)

### Step 1: Backup Your Local Database

**On your local machine:**

**If pg_dump is not in PATH (Mac with Homebrew):**

```bash
# Use full path to pg_dump
/usr/local/opt/postgresql@15/bin/pg_dump -U medusa_user -d purelinen_medusa -h localhost > local_backup.sql

# Or add to PATH temporarily
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
pg_dump -U medusa_user -d purelinen_medusa -h localhost > local_backup.sql

# Or if using different credentials:
/usr/local/opt/postgresql@15/bin/pg_dump -U your_local_db_user -d your_local_db_name -h localhost > local_backup.sql

# Compress it (optional, but recommended for large databases)
/usr/local/opt/postgresql@15/bin/pg_dump -U medusa_user -d purelinen_medusa -h localhost | gzip > local_backup.sql.gz
```

**If pg_dump is in PATH:**

```bash
# Create a backup of your local database
pg_dump -U medusa_user -d purelinen_medusa -h localhost > local_backup.sql

# Compress it (optional, but recommended for large databases)
pg_dump -U medusa_user -d purelinen_medusa -h localhost | gzip > local_backup.sql.gz
```

### Step 2: Transfer Backup to Server

**Option A: Using SCP**

```bash
# From your local machine
scp local_backup.sql purelinen@162.220.11.242:/home/purelinen/

# Or if compressed:
scp local_backup.sql.gz purelinen@162.220.11.242:/home/purelinen/
```

**Option B: Using cPanel File Manager**

1. Upload `local_backup.sql` via cPanel File Manager
2. Place it in `/home/purelinen/`

**Option C: Direct Pipe (No File Transfer)**

```bash
# From your local machine - directly pipe to server
# Use full path if pg_dump not in PATH
/usr/local/opt/postgresql@15/bin/pg_dump -U medusa_user -d purelinen_medusa -h localhost | \
  ssh purelinen@162.220.11.242 \
  "psql -U medusa_user -d purelinen_medusa -h localhost"

# Or if pg_dump is in PATH:
pg_dump -U medusa_user -d purelinen_medusa -h localhost | \
  ssh purelinen@162.220.11.242 \
  "psql -U medusa_user -d purelinen_medusa -h localhost"
```

### Step 3: Restore on Server

**SSH into server or use cPanel Terminal:**

```bash
# SSH into server
ssh purelinen@162.220.11.242

# Navigate to where backup is
cd /home/purelinen

# If compressed, decompress first
gunzip local_backup.sql.gz

# Restore database
psql -U medusa_user -d purelinen_medusa -h localhost < local_backup.sql

# Or if you need to specify password:
PGPASSWORD=your_password psql -U medusa_user -d purelinen_medusa -h localhost < local_backup.sql
```

### Step 4: Verify Migration

```bash
# On server, check tables
psql -U medusa_user -d purelinen_medusa -h localhost -c "\dt"

# Check record counts
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT COUNT(*) FROM product;"
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT COUNT(*) FROM customer;"
```

## Method 2: Using pg_dump with Custom Format (Better for Large DBs)

### Step 1: Create Custom Format Backup

**On local machine:**

```bash
# Custom format (allows selective restore)
pg_dump -U medusa_user -d purelinen_medusa -h localhost -Fc -f local_backup.dump

# Transfer to server
scp local_backup.dump purelinen@162.220.11.242:/home/purelinen/
```

### Step 2: Restore Custom Format

**On server:**

```bash
# Restore custom format
pg_restore -U medusa_user -d purelinen_medusa -h localhost local_backup.dump

# Or with verbose output
pg_restore -U medusa_user -d purelinen_medusa -h localhost -v local_backup.dump
```

## Method 3: Selective Migration (Tables Only)

If you only want to migrate data (not schema):

### Step 1: Dump Data Only

**On local machine:**

```bash
# Dump data only (no schema)
pg_dump -U medusa_user -d purelinen_medusa -h localhost --data-only > data_only.sql

# Or specific tables
pg_dump -U medusa_user -d purelinen_medusa -h localhost \
  -t product -t customer -t order > specific_tables.sql
```

### Step 2: Restore Data

**On server:**

```bash
# Make sure schema exists first (run migrations)
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
npx medusa db:migrate

# Then restore data
psql -U medusa_user -d purelinen_medusa -h localhost < data_only.sql
```

## Method 4: Using Medusa Migrations (If Applicable)

If you have Medusa migrations/seeds:

**On server:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Run migrations (creates schema)
npx medusa db:migrate

# Run seeds (if you have seed files)
npm run seed
```

## Important Considerations

### ⚠️ Before Migration

1. **Backup Production Database First:**
   ```bash
   # On server
   pg_dump -U medusa_user -d purelinen_medusa -h localhost > production_backup_$(date +%Y%m%d).sql
   ```

2. **Check Database Sizes:**
   ```bash
   # Local
   psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT pg_size_pretty(pg_database_size('purelinen_medusa'));"
   
   # Server
   psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT pg_size_pretty(pg_database_size('purelinen_medusa'));"
   ```

3. **Verify Server Has Enough Space:**
   ```bash
   # On server
   df -h
   ```

### 🔒 Security Notes

- **Don't commit database backups to git**
- **Use secure transfer methods** (SCP, SFTP)
- **Remove backup files after migration**
- **Use strong database passwords**

### 📋 Migration Checklist

- [ ] Backup local database
- [ ] Backup production database (if it exists)
- [ ] Check server disk space
- [ ] Verify database user permissions
- [ ] Transfer backup to server
- [ ] Restore database
- [ ] Verify data integrity
- [ ] Test application
- [ ] Update environment variables if needed
- [ ] Clean up backup files

## Troubleshooting

### Error: "permission denied"

```bash
# Check PostgreSQL user permissions
sudo -u postgres psql -c "\du medusa_user"

# Grant necessary permissions
sudo -u postgres psql -d purelinen_medusa -c "GRANT ALL PRIVILEGES ON DATABASE purelinen_medusa TO medusa_user;"
```

### Error: "database does not exist"

```bash
# Create database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE purelinen_medusa;"
```

### Error: "relation already exists"

This means tables already exist. Options:

1. **Drop and recreate:**
   ```bash
   # ⚠️ WARNING: This deletes all data!
   psql -U medusa_user -d purelinen_medusa -h localhost -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   ```

2. **Use --clean flag:**
   ```bash
   pg_restore -U medusa_user -d purelinen_medusa -h localhost --clean local_backup.dump
   ```

### Large Database Migration

For very large databases:

1. **Use compression:**
   ```bash
   pg_dump ... | gzip > backup.sql.gz
   ```

2. **Use custom format:**
   ```bash
   pg_dump -Fc ... -f backup.dump
   ```

3. **Migrate in chunks** (by table or date range)

4. **Use parallel restore:**
   ```bash
   pg_restore -j 4 -U medusa_user -d purelinen_medusa backup.dump
   ```

## Quick Reference Commands

### Local Database Info

```bash
# List all databases
psql -U medusa_user -h localhost -l

# List all tables
psql -U medusa_user -d purelinen_medusa -h localhost -c "\dt"

# Count records in a table
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT COUNT(*) FROM product;"
```

### Server Database Info

```bash
# Same commands, but SSH to server first
ssh purelinen@162.220.11.242
psql -U medusa_user -d purelinen_medusa -h localhost -c "\dt"
```

## Recommended Approach

**For your first migration:**

1. ✅ Backup local database
2. ✅ Backup production database (if exists)
3. ✅ Use Method 1 (pg_dump/psql) - simplest
4. ✅ Verify data after migration
5. ✅ Test your application

**For future updates:**

- Use selective migration (Method 3) for incremental updates
- Or use direct pipe method for quick syncs

## Next Steps After Migration

1. **Update Environment Variables:**
   - Verify `DATABASE_URL` in `.env` is correct
   - Check CORS settings
   - Verify API keys

2. **Test Application:**
   ```bash
   # On server
   pm2 restart purelinen-backend
   pm2 logs purelinen-backend
   ```

3. **Verify Data:**
   - Check products load correctly
   - Test customer login
   - Verify orders (if any)

Need help with any specific step? Let me know!
