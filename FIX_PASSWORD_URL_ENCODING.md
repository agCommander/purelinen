# Fix Password URL Encoding in DATABASE_URL

## The Problem

Your password has special characters that need URL encoding:
- Password: `x2X!6BubaYdZ4&DrvP#l`
- `!` → `%21`
- `&` → `%26`
- `#` → `%23`

## Fix the .env File

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Edit .env
nano .env
```

**Change DATABASE_URL from:**
```
DATABASE_URL=postgres://medusa_user:x2X!6BubaYdZ4&DrvP#l@127.0.0.1:5432/purelinen_medusa
```

**To (with URL-encoded password):**
```
DATABASE_URL=postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa
```

**URL Encoding Reference:**
- `!` = `%21`
- `&` = `%26`
- `#` = `%23`
- `@` = `%40` (if in password)
- `%` = `%25`
- `:` = `%3A`
- `/` = `%2F`
- `?` = `%3F`
- `=` = `%3D`

**Save:** Ctrl+X, Y, Enter

## Test After Fixing

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test connection
export $(grep DATABASE_URL .env | xargs)
psql "$DATABASE_URL" -c "SELECT 1;"

# If that works, try migration
npx medusa db:migrate
```

## Quick Fix Command

**Or use this to automatically encode:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Backup .env
cp .env .env.backup

# Replace password with URL-encoded version
sed -i 's/x2X!6BubaYdZ4&DrvP#l/x2X%216BubaYdZ4%26DrvP%23l/g' .env

# Verify
cat .env | grep DATABASE_URL
```

## Test Connection

```bash
# Test
export $(grep DATABASE_URL .env | xargs)
psql "$DATABASE_URL" -c "SELECT 1;"

# Try migration
npx medusa db:migrate
```

This should fix the connection timeout!
