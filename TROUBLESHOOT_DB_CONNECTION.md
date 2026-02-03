# Troubleshoot Database Connection - WHM Created Database

## The Issue

PostgreSQL is running, but Medusa can't connect. Database was created in WHM (not cPanel terminal) - this shouldn't matter, but let's verify everything.

## Step-by-Step Diagnosis

### Step 1: Verify Database Exists

**On server (cPanel Terminal):**

```bash
# List all databases
sudo -u postgres psql -l

# Or connect as postgres user
sudo -u postgres psql -c "\l"

# Look for: purelinen_medusa
```

### Step 2: Verify User Exists and Has Permissions

**On server:**

```bash
# Check if user exists
sudo -u postgres psql -c "\du medusa_user"

# Check user permissions on database
sudo -u postgres psql -d purelinen_medusa -c "\dp"

# Grant permissions if needed
sudo -u postgres psql << EOF
GRANT ALL PRIVILEGES ON DATABASE purelinen_medusa TO medusa_user;
\c purelinen_medusa
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medusa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medusa_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO medusa_user;
EOF
```

### Step 3: Test Connection with Exact Credentials

**On server:**

```bash
# Test connection
psql -U medusa_user -d purelinen_medusa -h localhost

# If it asks for password, enter it
# If it connects successfully, the credentials work
# Type \q to exit
```

### Step 4: Check .env File Format

**On server:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# View DATABASE_URL (be careful - password will be visible)
cat .env | grep DATABASE_URL

# Check the format - should be:
# DATABASE_URL=postgres://medusa_user:password@localhost:5432/purelinen_medusa
```

### Step 5: Test Connection Using .env Values

**On server:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Extract DATABASE_URL from .env
export $(grep DATABASE_URL .env | xargs)

# Test connection
psql "$DATABASE_URL" -c "SELECT 1;"
```

## Common Issues with WHM-Created Databases

### Issue 1: Different Database Name

WHM might have created the database with a different name. Check:

```bash
# List all databases
sudo -u postgres psql -c "\l"

# Look for your database - might be named differently
```

### Issue 2: Different User/Password

WHM might have created a different user. Check:

```bash
# List all users
sudo -u postgres psql -c "\du"

# Check which user owns the database
sudo -u postgres psql -c "\l" | grep purelinen
```

### Issue 3: Connection String Format

**Make sure your DATABASE_URL format is correct:**

```env
# Correct format:
DATABASE_URL=postgres://username:password@host:port/database

# Examples:
DATABASE_URL=postgres://medusa_user:mypassword@localhost:5432/purelinen_medusa
DATABASE_URL=postgres://medusa_user:mypassword@127.0.0.1:5432/purelinen_medusa
```

**Common mistakes:**
- ❌ Missing `postgres://` prefix
- ❌ Wrong port (should be `5432`)
- ❌ Special characters in password not URL-encoded
- ❌ Using `@` in password (needs to be `%40`)

### Issue 4: Password with Special Characters

If your password has special characters, they need to be URL-encoded:

```bash
# Example: password is "my@pass#123"
# In DATABASE_URL it should be: "my%40pass%23123"

# @ becomes %40
# # becomes %23
# % becomes %25
# & becomes %26
# etc.
```

## Quick Fix: Recreate Connection

### Option 1: Verify and Fix .env

**On server:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Edit .env
nano .env

# Make sure DATABASE_URL is exactly:
DATABASE_URL=postgres://medusa_user:your_actual_password@localhost:5432/purelinen_medusa

# Save and exit (Ctrl+X, Y, Enter)
```

### Option 2: Test with Explicit Connection

**On server:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test migration with explicit DATABASE_URL
DATABASE_URL="postgres://medusa_user:your_password@localhost:5432/purelinen_medusa" \
  npx medusa db:migrate
```

### Option 3: Check What WHM Actually Created

**In WHM or cPanel:**

1. Go to **PostgreSQL Databases** (in WHM or cPanel)
2. Check:
   - Database name
   - Username
   - Make sure they match your `.env` file

## Diagnostic Script

**Run this on server to check everything:**

```bash
#!/bin/bash
echo "=== PostgreSQL Status ==="
sudo systemctl status postgresql-15 --no-pager | head -5

echo -e "\n=== Databases ==="
sudo -u postgres psql -c "\l" | grep -E "Name|purelinen"

echo -e "\n=== Users ==="
sudo -u postgres psql -c "\du" | grep medusa

echo -e "\n=== Testing Connection ==="
psql -U medusa_user -d purelinen_medusa -h localhost -c "SELECT 1;" 2>&1

echo -e "\n=== .env DATABASE_URL ==="
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
grep DATABASE_URL .env | sed 's/:.*@/:****@/'  # Hide password
```

## Most Likely Solutions

1. **Password mismatch** - WHM password doesn't match .env
2. **Database name mismatch** - WHM created different name
3. **User name mismatch** - WHM created different user
4. **Password encoding** - Special characters need URL encoding

## Next Steps

1. **Check what WHM actually created:**
   - Database name
   - Username  
   - Password

2. **Update .env to match exactly**

3. **Test connection manually:**
   ```bash
   psql -U medusa_user -d purelinen_medusa -h localhost
   ```

4. **If manual connection works, try migration again**

What database name and username did WHM create? Check in WHM → PostgreSQL Databases and compare with your `.env` file.
