# Install phpPgAdmin on AlmaLinux/cPanel

## Installation Steps

### Step 1: Install Required Packages

**In WHM Terminal (as root):**

```bash
# Install PHP and required extensions
yum install -y php php-pgsql php-mbstring php-xml

# Or if using PHP 8.x
yum install -y php81-php php81-php-pgsql php81-php-mbstring php81-php-xml
```

### Step 2: Download phpPgAdmin

**In WHM Terminal:**

```bash
# Create directory for phpPgAdmin
mkdir -p /usr/share/phppgadmin
cd /usr/share/phppgadmin

# Download phpPgAdmin (latest version)
wget https://github.com/phppgadmin/phppgadmin/archive/REL_7-14-0.tar.gz

# Extract
tar -xzf REL_7-14-0.tar.gz
mv phppgadmin-REL_7-14-0/* .
rm -rf phppgadmin-REL_7-14-0 REL_7-14-0.tar.gz
```

### Step 3: Configure phpPgAdmin

**In WHM Terminal:**

```bash
cd /usr/share/phppgadmin

# Copy config file
cp conf/config.inc.php-dist conf/config.inc.php

# Edit config
nano conf/config.inc.php
```

**Find and modify these settings:**

```php
// Around line 30-40
$conf['servers'][0]['host'] = 'localhost';
$conf['servers'][0]['port'] = 5432;
$conf['servers'][0]['sslmode'] = 'disable';

// Around line 60-70 - Set default database
$conf['servers'][0]['defaultdb'] = 'postgres';

// Around line 100 - Enable extra login security (optional)
$conf['extra_login_security'] = false;
```

**Save and exit** (Ctrl+X, Y, Enter)

### Step 4: Set Permissions

**In WHM Terminal:**

```bash
# Set ownership (adjust to your web server user)
chown -R nobody:nobody /usr/share/phppgadmin
chmod -R 755 /usr/share/phppgadmin
```

### Step 5: Create Symbolic Link in cPanel

**In WHM Terminal:**

```bash
# Create link in public_html (adjust username)
ln -s /usr/share/phppgadmin /home/purelinen/public_html/phppgadmin

# Or create subdomain for it
# In cPanel: Subdomains → Create "phppgadmin" subdomain
# Then link:
ln -s /usr/share/phppgadmin /home/purelinen/public_html/phppgadmin.purelinen.com.au
```

### Step 6: Access phpPgAdmin

**Via Browser:**
- `http://your-domain.com/phppgadmin`
- Or `https://phppgadmin.purelinen.com.au` (if you created subdomain)

**Login:**
- Server: `localhost`
- Username: `medusa_user` (or `postgres`)
- Password: Your PostgreSQL password
- Database: `purelinen_medusa` (or leave blank)

## Alternative: Use cPanel's Built-in PostgreSQL Tool

Some cPanel installations have a PostgreSQL tool. Check:

1. **In cPanel**, look for:
   - **PostgreSQL Databases** → **phpPgAdmin** link
   - Or **Advanced** → **PostgreSQL**
   - Or **Databases** → **PostgreSQL Databases**

2. If it exists, click it - no installation needed!

## Alternative: Install via cPanel App Installer

**In cPanel:**
1. Look for **Softaculous Apps Installer** or **Application Manager**
2. Search for "phpPgAdmin"
3. Install if available

## Quick Alternative: Use psql Directly

If installation is complex, you can use psql commands directly:

**In WHM Terminal:**

```bash
# Connect to database
su - postgres
psql -d purelinen_medusa

# Now you can run SQL commands:
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';
SELECT * FROM pg_stat_activity;
\dt  # List tables
\q   # Exit
```

## Recommended: Check cPanel First

**Before installing, check if cPanel already has it:**

1. Log into **cPanel**
2. Look for **PostgreSQL Databases** section
3. Check if there's a **phpPgAdmin** link or button
4. Many cPanel installations include it by default

## If Installation Fails

**Use command line instead:**

```bash
# In WHM Terminal
su - postgres
psql -d purelinen_medusa

# Run SQL commands directly
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';
```

Let me know what you find in cPanel's PostgreSQL section - it might already be there!
