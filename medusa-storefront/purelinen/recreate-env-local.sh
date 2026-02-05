#!/bin/bash

# Script to recreate .env.local file for Pure Linen storefront
# Run this from: medusa-storefront/purelinen/

echo "Creating .env.local file for Pure Linen storefront..."

cat > .env.local << 'ENVEOF'
# Medusa Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=CHANGE_ME_YOUR_PUBLISHABLE_KEY

# Storefront URL
NEXT_PUBLIC_BASE_URL=https://newpl.purelinen.com.au

# Region
NEXT_PUBLIC_DEFAULT_REGION=au

# Stripe (Public Key - starts with pk_)
NEXT_PUBLIC_STRIPE_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY_HERE

# PayPal (Client ID only - public, if using PayPal)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE
ENVEOF

chmod 600 .env.local

echo "✅ .env.local file created!"
echo ""
echo "⚠️  IMPORTANT: You need to update these values:"
echo "   1. NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY - Get from Medusa admin"
echo "   2. NEXT_PUBLIC_STRIPE_KEY - Your Stripe public key (starts with pk_)"
echo "   3. NEXT_PUBLIC_PAYPAL_CLIENT_ID - Your PayPal Client ID (if using PayPal)"
echo ""
echo "To edit: nano .env.local"
