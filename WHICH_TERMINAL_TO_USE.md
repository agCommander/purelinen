# Which Terminal to Use: WHM vs cPanel

## Quick Guide

### Use cPanel Terminal For:
- ✅ Working with your application files
- ✅ Running npm/node commands
- ✅ Git operations
- ✅ PM2 commands
- ✅ Editing .env files
- ✅ Running Medusa migrations
- ✅ Most day-to-day operations

### Use WHM Terminal For:
- ✅ System-level PostgreSQL configuration
- ✅ Editing PostgreSQL config files (`/var/lib/pgsql/15/data/`)
- ✅ Restarting PostgreSQL service
- ✅ System-wide changes

## For Your Current Tasks

### Kill PostgreSQL Connections → **cPanel Terminal**

```bash
# In cPanel Terminal
sudo -u postgres psql -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
  AND pid <> pg_backend_pid();
"
```

### Run Medusa Migrations → **cPanel Terminal**

```bash
# In cPanel Terminal
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
npx medusa db:migrate
```

### Restart PostgreSQL → **WHM Terminal** (or cPanel with sudo)

```bash
# In WHM Terminal (as root)
systemctl restart postgresql-15

# OR in cPanel Terminal (with sudo)
sudo systemctl restart postgresql-15
```

### Edit PostgreSQL Config → **WHM Terminal**

```bash
# In WHM Terminal (as root)
nano /var/lib/pgsql/15/data/postgresql.conf
```

### Work with Application Files → **cPanel Terminal**

```bash
# In cPanel Terminal
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
nano .env
npm install
pm2 status
```

## General Rule

- **cPanel Terminal** = Your application and user-level tasks
- **WHM Terminal** = System administration (root-level tasks)

## For Database Migration Issue

**Use cPanel Terminal:**

```bash
# 1. Kill idle connections
sudo -u postgres psql -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
  AND pid <> pg_backend_pid();
"

# 2. Navigate to backend
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# 3. Run migrations
npx medusa db:migrate
```

## Quick Check: Which Terminal Am I In?

**Check your prompt:**
- **WHM Terminal**: Usually shows `[root@host ~]#` (root user)
- **cPanel Terminal**: Usually shows `[purelinen@host ~]$` (your username)

**Or check user:**
```bash
whoami
# WHM: root
# cPanel: purelinen (or your cPanel username)
```

## Summary

**For 99% of your work, use cPanel Terminal.**

Only use WHM Terminal when you need root access for system configuration.
