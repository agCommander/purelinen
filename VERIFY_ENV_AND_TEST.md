# Verify .env and Test Connection

## Step 1: Verify .env File Content

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Show actual DATABASE_URL (be careful - password visible)
cat .env | grep DATABASE_URL

# Check if it starts with postgres://
cat .env | grep DATABASE_URL | grep -q "postgres://" && echo "✅ Has postgres://" || echo "❌ Missing postgres://"
```

## Step 2: Test Connection with .env Value

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Load .env
export $(grep DATABASE_URL .env | xargs)

# Test connection
echo "Testing connection..."
psql "$DATABASE_URL" -c "SELECT 1;" 2>&1

# If that works, the URL is correct
```

## Step 3: Test if Node.js Can Read It

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test with Node.js dotenv
node -e "
require('dotenv').config();
const url = process.env.DATABASE_URL;
console.log('DATABASE_URL found:', !!url);
console.log('Starts with postgres://:', url ? url.startsWith('postgres://') : false);
console.log('Length:', url ? url.length : 0);
if (url) {
  console.log('First 30 chars:', url.substring(0, 30) + '...');
}
"
```

## Step 4: Try Migration with Explicit Variable

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Get DATABASE_URL
export $(grep DATABASE_URL .env | xargs)

# Verify it's set correctly
echo "DATABASE_URL starts with: ${DATABASE_URL:0:12}"

# Try migration
npx medusa db:migrate
```

## Step 5: Check for Hidden Characters

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check for hidden characters or issues
cat .env | grep DATABASE_URL | od -c | head -5
```

## Common Issues

### Issue 1: Password Has Special Characters

If your password has `@`, `#`, `%`, etc., they need URL encoding:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

### Issue 2: Spaces or Quotes

Make sure there are no spaces or quotes:
```env
✅ Correct: DATABASE_URL=postgres://user:pass@host:5432/db
❌ Wrong:   DATABASE_URL="postgres://user:pass@host:5432/db"
❌ Wrong:   DATABASE_URL = postgres://user:pass@host:5432/db
```

### Issue 3: Multiple DATABASE_URL Lines

Check if there are multiple DATABASE_URL entries:
```bash
grep -n DATABASE_URL .env
```

## Quick Test

Run this to verify everything:

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

echo "=== 1. .env file ==="
cat .env | grep DATABASE_URL

echo -e "\n=== 2. Test psql ==="
export $(grep DATABASE_URL .env | xargs)
psql "$DATABASE_URL" -c "SELECT 1;" 2>&1

echo -e "\n=== 3. Test Node.js ==="
node -e "require('dotenv').config(); console.log('URL found:', !!process.env.DATABASE_URL);"

echo -e "\n=== 4. Try migration ==="
npx medusa db:migrate 2>&1 | head -20
```

Run these tests and share the output!
