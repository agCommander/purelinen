# Linen Things Environment Configuration Guide

## Backend .env Configuration

Add these PayPal variables to your **backend** `.env` file (`medusa-backend/purelinen/.env`):

```env
# Stripe Configuration (already added)
STRIPE_API_KEY=sk_test_your_stripe_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# PayPal Configuration
PAYPAL_SANDBOX=true
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_AUTH_WEBHOOK_ID=your_paypal_webhook_id_here
```

**Note:** For production, change `PAYPAL_SANDBOX=true` to `PAYPAL_SANDBOX=false`

## Storefront .env.local Configuration

Create or update `.env.local` in `medusa-storefront/linenthings/`:

```env
# Medusa Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here

# Storefront URL
NEXT_PUBLIC_BASE_URL=https://newlt.linenthings.com.au

# Region
NEXT_PUBLIC_DEFAULT_REGION=au

# Stripe (Public Key - starts with pk_)
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_public_key_here

# PayPal (Client ID only - public)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

## Important Notes

### Backend vs Storefront Variables

**Backend (.env):**
- `STRIPE_API_KEY` - Secret key (starts with `sk_`)
- `PAYPAL_CLIENT_SECRET` - Secret (never expose to frontend)
- `PAYPAL_AUTH_WEBHOOK_ID` - Webhook ID for backend

**Storefront (.env.local):**
- `NEXT_PUBLIC_STRIPE_KEY` - Public key (starts with `pk_`)
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` - Client ID only (public, safe for frontend)

### PayPal Environment Variables Explained

- **PAYPAL_SANDBOX**: `true` for testing, `false` for production
- **PAYPAL_CLIENT_ID**: Your PayPal app client ID (same for backend and frontend)
- **PAYPAL_CLIENT_SECRET**: Your PayPal app secret (backend only!)
- **PAYPAL_AUTH_WEBHOOK_ID**: Webhook ID for payment notifications (backend only)

### Getting PayPal Credentials

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Log in or create a developer account
3. Go to **Dashboard** → **My Apps & Credentials**
4. Create a new app (or use existing)
5. Copy:
   - **Client ID** (use in both backend and storefront)
   - **Secret** (use only in backend)
   - **Webhook ID** (if you set up webhooks)

### Getting Stripe Credentials

**Backend (Secret Key):**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers** → **API keys**
3. Copy **Secret key** (starts with `sk_test_` for testing, `sk_live_` for production)

**Storefront (Public Key):**
1. Same page in Stripe dashboard
2. Copy **Publishable key** (starts with `pk_test_` for testing, `pk_live_` for production)

## Complete Example Files

### Backend `.env` (medusa-backend/purelinen/.env)

```env
# Database
DATABASE_URL=postgres://medusa_user:password@localhost:5432/purelinen_medusa

# CORS - Staging
STORE_CORS=https://newpl.purelinen.com.au,https://newlt.linenthings.com.au
ADMIN_CORS=https://api-new.purelinen.com.au
AUTH_CORS=https://api-new.purelinen.com.au

# Security
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here

# Stripe
STRIPE_API_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# PayPal
PAYPAL_SANDBOX=true
PAYPAL_CLIENT_ID=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
PAYPAL_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
PAYPAL_AUTH_WEBHOOK_ID=your_webhook_id_here

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_SES_FROM_EMAIL=noreply@purelinen.com.au

# Environment
NODE_ENV=production
PORT=9000
```

### Storefront `.env.local` (medusa-storefront/linenthings/.env.local)

```env
# Medusa Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here

# Storefront
NEXT_PUBLIC_BASE_URL=https://newlt.linenthings.com.au
NEXT_PUBLIC_DEFAULT_REGION=au

# Stripe (Public Key)
NEXT_PUBLIC_STRIPE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890

# PayPal (Client ID only)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

## Testing

After configuring:

1. **Backend:** Restart your Medusa backend
   ```bash
   pm2 restart purelinen-backend
   ```

2. **Storefront:** Restart your Next.js storefront
   ```bash
   npm run dev
   # or in production
   pm2 restart linenthings-storefront
   ```

3. **Test Payments:**
   - Go to checkout
   - You should see both Stripe and PayPal payment options
   - Use test cards/accounts to verify

## Security Checklist

- [ ] Never commit `.env` or `.env.local` files to git
- [ ] Use test keys (`sk_test_`, `pk_test_`) for staging
- [ ] Use production keys (`sk_live_`, `pk_live_`) only in production
- [ ] Keep `PAYPAL_CLIENT_SECRET` only in backend
- [ ] Keep `STRIPE_API_KEY` (secret) only in backend
- [ ] Only public keys (`pk_`, `PAYPAL_CLIENT_ID`) go in storefront

## Troubleshooting

### PayPal button not showing
- Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in storefront `.env.local`
- Verify PayPal is enabled in Medusa admin panel
- Check browser console for errors

### Stripe payment failing
- Verify `NEXT_PUBLIC_STRIPE_KEY` matches your Stripe account
- Check backend has correct `STRIPE_API_KEY`
- Ensure webhook is configured in Stripe dashboard

### Payment methods not appearing
- Check Medusa admin → Settings → Payment Providers
- Ensure both Stripe and PayPal are enabled
- Verify environment variables are loaded (restart backend)
