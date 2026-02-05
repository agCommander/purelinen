#!/bin/bash

# Script to recreate .env file for backend
# Run this from: /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

echo "Creating .env file..."

cat > .env << 'ENVEOF'
# Database Configuration
DATABASE_URL=postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa

# CORS Configuration - STAGING URLs
STORE_CORS=https://newpl.purelinen.com.au,https://newlt.linenthings.com.au
ADMIN_CORS=https://api-new.purelinen.com.au
AUTH_CORS=https://api-new.purelinen.com.au

# Security Secrets
# TODO: Generate new secrets with: openssl rand -base64 32
JWT_SECRET=CHANGE_ME_GENERATE_NEW_SECRET_MIN_32_CHARS
COOKIE_SECRET=CHANGE_ME_GENERATE_NEW_SECRET_MIN_32_CHARS

# Stripe Payment
# TODO: Add your Stripe keys
STRIPE_API_KEY=sk_live_YOUR_STRIPE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# PayPal Payment
# TODO: Add your PayPal credentials
PAYPAL_SANDBOX=false
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET
PAYPAL_AUTH_WEBHOOK_ID=YOUR_PAYPAL_WEBHOOK_ID

# AWS SES Email Configuration
# TODO: Add your AWS credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_SES_FROM_EMAIL=noreply@purelinen.com.au

# Environment
NODE_ENV=production

# Port
PORT=9000
ENVEOF

chmod 600 .env

echo "✅ .env file created!"
echo ""
echo "⚠️  IMPORTANT: You need to update these values:"
echo "   1. JWT_SECRET - Generate with: openssl rand -base64 32"
echo "   2. COOKIE_SECRET - Generate with: openssl rand -base64 32"
echo "   3. STRIPE_API_KEY - Your Stripe secret key"
echo "   4. STRIPE_WEBHOOK_SECRET - Your Stripe webhook secret"
echo "   5. PayPal credentials (if using PayPal)"
echo "   6. AWS credentials (if using AWS SES)"
echo ""
echo "To edit: nano .env"
