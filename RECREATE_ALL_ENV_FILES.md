# Recreate All Environment Files

Quick guide to recreate all `.env` and `.env.local` files that were lost.

## Backend .env File

**On the server (cPanel Terminal):**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa

# CORS Configuration - STAGING URLs
STORE_CORS=https://newpl.purelinen.com.au,https://newlt.linenthings.com.au
ADMIN_CORS=https://api-new.purelinen.com.au
AUTH_CORS=https://api-new.purelinen.com.au

# Security Secrets
JWT_SECRET=${JWT_SECRET}
COOKIE_SECRET=${COOKIE_SECRET}

# Stripe Payment
STRIPE_API_KEY=sk_live_YOUR_STRIPE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# PayPal Payment (if using)
PAYPAL_SANDBOX=false
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET
PAYPAL_AUTH_WEBHOOK_ID=YOUR_PAYPAL_WEBHOOK_ID

# AWS SES Email Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_SES_FROM_EMAIL=noreply@purelinen.com.au

# Environment
NODE_ENV=production
PORT=9000
EOF

chmod 600 .env

# Edit to add your API keys
nano .env
```

**Or use the script:**
```bash
bash recreate-env.sh
nano .env  # Add your API keys
```

## Pure Linen Storefront .env.local

**On the server (if storefront is deployed) OR locally:**

```bash
cd /path/to/medusa-storefront/purelinen

cat > .env.local << EOF
# Medusa Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY_HERE

# Storefront URL
NEXT_PUBLIC_BASE_URL=https://newpl.purelinen.com.au

# Region
NEXT_PUBLIC_DEFAULT_REGION=au

# Stripe (Public Key - starts with pk_)
NEXT_PUBLIC_STRIPE_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY_HERE

# PayPal (Client ID only - public, if using PayPal)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE
EOF

chmod 600 .env.local

# Edit to add your keys
nano .env.local
```

**Or use the script:**
```bash
bash recreate-env-local.sh
nano .env.local  # Add your keys
```

## Linen Things Storefront .env.local

**On the server (if storefront is deployed) OR locally:**

```bash
cd /path/to/medusa-storefront/linenthings

cat > .env.local << EOF
# Medusa Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY_HERE

# Storefront URL
NEXT_PUBLIC_BASE_URL=https://newlt.linenthings.com.au

# Region
NEXT_PUBLIC_DEFAULT_REGION=au

# Stripe (Public Key - starts with pk_)
NEXT_PUBLIC_STRIPE_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY_HERE

# PayPal (Client ID only - public, if using PayPal)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE
EOF

chmod 600 .env.local

# Edit to add your keys
nano .env.local
```

**Or use the script:**
```bash
bash recreate-env-local.sh
nano .env.local  # Add your keys
```

## After Creating Files

### Backend:
```bash
# Restart PM2 to load new environment
pm2 restart purelinen-backend --update-env
```

### Storefronts:
```bash
# Rebuild and restart (if deployed)
npm run build
# Then restart your Next.js process
```

## Getting Your Keys

### Medusa Publishable Key:
1. Log into Medusa admin: `https://api-new.purelinen.com.au/app`
2. Go to **Settings** → **Publishable API Keys**
3. Copy the key (or create a new one)

### Stripe Keys:
- **Public Key (pk_)**: Stripe Dashboard → Developers → API keys → Publishable key
- **Secret Key (sk_)**: Stripe Dashboard → Developers → API keys → Secret key
- **Webhook Secret**: Stripe Dashboard → Developers → Webhooks → Your webhook → Signing secret

### PayPal Keys:
- **Client ID**: PayPal Developer Dashboard → My Apps & Credentials → Your app → Client ID
- **Client Secret**: Same page → Secret
- **Webhook ID**: PayPal Developer Dashboard → Webhooks → Your webhook → Webhook ID

### AWS SES:
- **Access Key ID & Secret**: AWS Console → IAM → Users → Your user → Security credentials

## Quick Checklist

- [ ] Backend `.env` created with database URL
- [ ] Backend `.env` has JWT_SECRET and COOKIE_SECRET (generated)
- [ ] Backend `.env` has Stripe keys
- [ ] Backend `.env` has PayPal keys (if using)
- [ ] Backend `.env` has AWS SES keys
- [ ] Pure Linen `.env.local` created
- [ ] Pure Linen `.env.local` has publishable key
- [ ] Pure Linen `.env.local` has Stripe public key
- [ ] Linen Things `.env.local` created
- [ ] Linen Things `.env.local` has publishable key
- [ ] Linen Things `.env.local` has Stripe public key
- [ ] Backend restarted with `pm2 restart purelinen-backend --update-env`

## Prevent Future Loss

**Create backups (NOT in git):**

```bash
# Backend
cp /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen/.env ~/.env.backend.backup

# Storefronts (if on server)
cp /path/to/storefront/.env.local ~/.env.purelinen.backup
cp /path/to/storefront/.env.local ~/.env.linenthings.backup
```

**Or store securely:**
- Use a password manager
- Store in a secure note/document (not in git)
- Use environment variable management tools
