# Staging Environment Setup Guide

## Your Staging Subdomains

- **Pure Linen Storefront:** `newpl.purelinen.com.au`
- **Linen Things Storefront:** `newlt.linenthings.com.au`
- **Backend API:** `api-new.purelinen.com.au` (or whatever you choose)

## Backend .env Configuration

Create your `.env` file in `medusa-backend/purelinen/` with these settings:

```env
# Database Configuration
DATABASE_URL=postgres://medusa_user:your_password@localhost:5432/purelinen_medusa

# CORS Configuration - STAGING URLs
STORE_CORS=https://newpl.purelinen.com.au,https://newlt.linenthings.com.au
ADMIN_CORS=https://api-new.purelinen.com.au
AUTH_CORS=https://api-new.purelinen.com.au

# Security Secrets (generate new ones for staging)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
COOKIE_SECRET=your_super_secret_cookie_key_min_32_characters_long

# Stripe Payment (Use TEST keys for staging)
STRIPE_API_KEY=sk_test_your_stripe_test_key_here

# AWS SES Email Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_SES_FROM_EMAIL=noreply@purelinen.com.au

# Environment
NODE_ENV=production

# Port
PORT=9000
```

## Important Notes

### 1. Backend API Subdomain

You'll need to create a subdomain for your backend API. Common options:
- `api-new.purelinen.com.au`
- `newapi.purelinen.com.au`
- `backend-new.purelinen.com.au`

**In cPanel:**
1. Go to **Subdomains**
2. Create subdomain: `api-new` (or your choice)
3. Point it to a directory (doesn't matter, we'll use reverse proxy)
4. Configure reverse proxy to `http://localhost:9000`

### 2. Storefront .env Files

You'll also need to update the storefront `.env.local` files:

**For Pure Linen storefront (`medusa-storefront/purelinen/.env.local`):**
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_BASE_URL=https://newpl.purelinen.com.au
NEXT_PUBLIC_DEFAULT_REGION=au
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_test_key
```

**For Linen Things storefront (`medusa-storefront/linenthings/.env.local`):**
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_BASE_URL=https://newlt.linenthings.com.au
NEXT_PUBLIC_DEFAULT_REGION=au
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_test_key
```

### 3. SSL Certificates

Make sure SSL certificates are installed for all subdomains:
- `newpl.purelinen.com.au`
- `newlt.linenthings.com.au`
- `api-new.purelinen.com.au` (or your backend subdomain)

**In cPanel:**
- Go to **SSL/TLS Status**
- Install Let's Encrypt certificates for each subdomain

### 4. Testing Checklist

- [ ] Backend API accessible at `https://api-new.purelinen.com.au`
- [ ] Pure Linen storefront accessible at `https://newpl.purelinen.com.au`
- [ ] Linen Things storefront accessible at `https://newlt.linenthings.com.au`
- [ ] CORS allows requests from both storefronts
- [ ] SSL certificates installed for all subdomains
- [ ] Database migrations completed
- [ ] PM2 running backend successfully

## When Ready to Go Live

When you're ready to replace the live sites:

1. **Update backend `.env`:**
   ```env
   STORE_CORS=https://purelinen.com.au,https://www.purelinen.com.au,https://linenthings.com.au,https://www.linenthings.com.au
   ADMIN_CORS=https://api.purelinen.com.au
   AUTH_CORS=https://api.purelinen.com.au
   ```

2. **Update storefront `.env.local` files** with production URLs

3. **Switch DNS** to point production domains to new servers

4. **Use production Stripe keys** instead of test keys

## Quick Reference

**Staging URLs:**
- Backend: `https://api-new.purelinen.com.au`
- Pure Linen: `https://newpl.purelinen.com.au`
- Linen Things: `https://newlt.linenthings.com.au`

**Production URLs (for later):**
- Backend: `https://api.purelinen.com.au`
- Pure Linen: `https://purelinen.com.au`
- Linen Things: `https://linenthings.com.au`
