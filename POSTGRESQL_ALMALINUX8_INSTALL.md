# PostgreSQL Installation for AlmaLinux 8.10

## Step-by-Step Installation

### 1. Install PostgreSQL Official Repository

```bash
# Install the PostgreSQL repository for RHEL 8
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
```

### 2. Disable Conflicting AppStream Module (IMPORTANT!)

AlmaLinux 8 has a PostgreSQL module in AppStream that conflicts with the official repository. You must disable it first:

```bash
# Disable the conflicting PostgreSQL module
sudo dnf module disable postgresql -y
```

### 3. Install PostgreSQL 15

```bash
# Install PostgreSQL 15 server and client
sudo yum install -y postgresql15-server postgresql15
```

**If you still get modular filtering errors, try:**

```bash
# Method 1: Use dnf instead of yum and disable modules
sudo dnf module disable postgresql -y
sudo dnf install -y postgresql15-server postgresql15 --disablerepo=AppStream

# Method 2: Install from specific repository
sudo dnf install -y postgresql15-server postgresql15 --enablerepo=pgdg15

# Method 3: Check what's blocking it
sudo dnf module list postgresql
sudo dnf module reset postgresql -y
sudo dnf module disable postgresql -y
sudo dnf install -y postgresql15-server postgresql15
```

**Note:** If PostgreSQL 15 is still not available, you can check what versions are available:
```bash
yum list available | grep postgresql
```

You can also install PostgreSQL 14 or 13 if 15 isn't available:
```bash
# For PostgreSQL 14
sudo yum install -y postgresql14-server postgresql14

# For PostgreSQL 13
sudo yum install -y postgresql13-server postgresql13
```

### 4. Initialize the Database

**For PostgreSQL 15:**
```bash
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
```

**For PostgreSQL 14:**
```bash
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb
```

**For PostgreSQL 13:**
```bash
sudo /usr/pgsql-13/bin/postgresql-13-setup initdb
```

### 5. Start and Enable PostgreSQL

**For PostgreSQL 15:**
```bash
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

**For PostgreSQL 14:**
```bash
sudo systemctl start postgresql-14
sudo systemctl enable postgresql-14
```

**For PostgreSQL 13:**
```bash
sudo systemctl start postgresql-13
sudo systemctl enable postgresql-13
```

### 6. Verify Installation

```bash
# Check PostgreSQL status
sudo systemctl status postgresql-15

# Check PostgreSQL version
sudo -u postgres psql --version
```

### 7. Configure PostgreSQL for Remote Access (Optional)

Edit the PostgreSQL configuration:
```bash
# For PostgreSQL 15
sudo nano /var/lib/pgsql/15/data/postgresql.conf
```

Find and uncomment/modify:
```
listen_addresses = 'localhost'
```

Edit pg_hba.conf:
```bash
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

Add a line for local connections:
```
host    all             all             127.0.0.1/32            md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql-15
```

### 8. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE purelinen_medusa;
CREATE USER medusa_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE purelinen_medusa TO medusa_user;
ALTER USER medusa_user CREATEDB;  # Allow creating databases (for migrations)
\q
```

### 9. Test Connection

```bash
# Test connection
psql -U medusa_user -d purelinen_medusa -h localhost
# Enter password when prompted
```

## Troubleshooting

### If you get "modular filtering" errors:

This is the most common issue! The AppStream PostgreSQL module conflicts with the official repo:

```bash
# Disable the conflicting module
sudo dnf module disable postgresql -y

# Reset the module if it's already enabled
sudo dnf module reset postgresql -y

# Then try installing again
sudo dnf install -y postgresql15-server postgresql15

# Alternative: Install while disabling AppStream repo
sudo dnf install -y postgresql15-server postgresql15 --disablerepo=AppStream
```

### If repository installation fails:

Try installing EPEL first:
```bash
sudo yum install -y epel-release
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
```

### If PostgreSQL 15 is not available:

Check available versions:
```bash
yum --enablerepo=pgdg15 list available | grep postgresql
```

Install PostgreSQL 14 instead (still compatible with Medusa):
```bash
sudo yum install -y postgresql14-server postgresql14
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb
sudo systemctl start postgresql-14
sudo systemctl enable postgresql-14
```

### Find PostgreSQL data directory:

```bash
# For PostgreSQL 15
ls -la /var/lib/pgsql/15/data/

# For PostgreSQL 14
ls -la /var/lib/pgsql/14/data/
```

### Check PostgreSQL logs:

```bash
# For PostgreSQL 15
sudo tail -f /var/lib/pgsql/15/data/log/postgresql-*.log

# Or check systemd logs
sudo journalctl -u postgresql-15 -f
```

## Quick Reference

**PostgreSQL 15 paths:**
- Binary: `/usr/pgsql-15/bin/`
- Data: `/var/lib/pgsql/15/data/`
- Service: `postgresql-15`

**PostgreSQL 14 paths:**
- Binary: `/usr/pgsql-14/bin/`
- Data: `/var/lib/pgsql/14/data/`
- Service: `postgresql-14`

## Next Steps

After PostgreSQL is installed, continue with:
1. Creating your `.env` file with the `DATABASE_URL`
2. Running database migrations
3. Starting your Medusa backend

Your `DATABASE_URL` will be:
```
postgres://medusa_user:your_password@localhost:5432/purelinen_medusa
```
