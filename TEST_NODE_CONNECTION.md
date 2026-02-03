# Test Node.js Connection with URL-Encoded Password

## Step 1: Test if Node.js Can Connect

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test Node.js connection with URL-encoded password
node -e "
const { Client } = require('pg');
const url = 'postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa';
console.log('Testing connection with:', url.substring(0, 40) + '...');
const client = new Client({ 
  connectionString: url,
  connectionTimeoutMillis: 5000
});
client.connect()
  .then(() => {
    console.log('✅ Node.js connected successfully!');
    return client.query('SELECT 1');
  })
  .then(() => {
    console.log('✅ Query successful!');
    client.end();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"
```

## Step 2: Test with .env File

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Test if dotenv loads it correctly
node -e "
require('dotenv').config();
const url = process.env.DATABASE_URL;
console.log('DATABASE_URL loaded:', !!url);
if (url) {
  console.log('First 50 chars:', url.substring(0, 50));
  console.log('Contains %21:', url.includes('%21'));
  console.log('Contains %26:', url.includes('%26'));
  console.log('Contains %23:', url.includes('%23'));
}
"
```

## Step 3: Try Migration with Explicit DATABASE_URL

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Export DATABASE_URL explicitly
export DATABASE_URL="postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa"

# Verify it's set
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

# Try migration
npx medusa db:migrate
```

## Step 4: Check if Medusa is Reading .env

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check what directory Medusa runs from
node -e "
const path = require('path');
console.log('Current directory:', process.cwd());
console.log('.env exists:', require('fs').existsSync('.env'));
"

# Try running migration with explicit NODE_ENV
NODE_ENV=production npx medusa db:migrate 2>&1 | head -20
```

## Alternative: Try Without URL Encoding (Quote the URL)

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Try with quoted URL (might work differently)
export DATABASE_URL='postgres://medusa_user:x2X!6BubaYdZ4&DrvP#l@127.0.0.1:5432/purelinen_medusa'

# Test
psql "$DATABASE_URL" -c "SELECT 1;"

# Try migration
npx medusa db:migrate
```

## Check PostgreSQL Logs

**In WHM Terminal:**

```bash
# Check if PostgreSQL is receiving connection attempts
tail -50 /var/lib/pgsql/15/data/log/postgresql-*.log | grep -i "medusa\|connection\|timeout\|failed"
```

Run Step 1 and Step 3 first - that will tell us if Node.js can connect and if explicit export works!
