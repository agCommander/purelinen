# Environment Variables Template

Copy this content to create your `.env` file. **DO NOT commit the `.env` file to git!**

```env
# Database Configuration
# Format: postgres://username:password@host:port/database
DATABASE_URL=postgres://medusa_user:your_password@localhost:5432/purelinen_medusa

# CORS Configuration
# Comma-separated list of allowed origins (no spaces after commas)
STORE_CORS=https://purelinen.com.au,https://www.purelinen.com.au,https://linenthings.com.au,https://www.linenthings.com.au
ADMIN_CORS=https://api.purelinen.com.au
AUTH_CORS=https://api.purelinen.com.au

# Security Secrets
# Generate secure secrets with: openssl rand -base64 32
# These should be at least 32 characters long
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
COOKIE_SECRET=your_super_secret_cookie_key_min_32_characters_long

# Stripe Payment (Optional - only if using Stripe)
STRIPE_API_KEY=sk_live_your_stripe_key_here

# AWS SES Email Configuration (Required for transactional emails)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_SES_FROM_EMAIL=noreply@purelinen.com.au

# Environment
NODE_ENV=production

# Port (default: 9000)
PORT=9000
```

## Quick Setup Commands

```bash
# Generate secure secrets
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "COOKIE_SECRET=$(openssl rand -base64 32)"

# Create .env file (copy the template above and paste)
nano .env
```

## Important Notes

1. **Never commit `.env` to git** - It contains sensitive credentials
2. **Use strong passwords** for database and secrets
3. **Update CORS URLs** to match your actual production domains
4. **Test database connection** before starting the app
5. **Verify AWS SES credentials** are correct for your region
