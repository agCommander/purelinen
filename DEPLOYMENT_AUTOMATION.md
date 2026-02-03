# Automated Deployment Setup Guide

## Option 1: GitHub Actions (Recommended)

GitHub Actions can automatically deploy your backend when you push to GitHub.

### Setup Steps

#### 1. Create GitHub Actions Workflow

The workflow file is already created at `.github/workflows/deploy-backend.yml`

#### 2. Set Up SSH Access to Your Server

**On your server, create a deployment user (optional but recommended):**

```bash
# Create a new user for deployments
sudo adduser deployer
sudo usermod -aG wheel deployer  # Give sudo access if needed

# Or use your existing user
```

**Set up SSH key authentication:**

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "github-actions-deploy"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub purelinen@your-server-ip

# Test SSH connection
ssh purelinen@your-server-ip
```

#### 3. Configure GitHub Secrets

In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

   - **SSH_HOST**: Your server IP or domain (e.g., `123.45.67.89` or `host.purelinen.com.au`)
   - **SSH_USER**: Your SSH username (e.g., `purelinen`)
   - **SSH_PRIVATE_KEY**: Your private SSH key (the content of `~/.ssh/id_ed25519` or `~/.ssh/id_rsa`)
   - **SSH_PORT**: SSH port (usually `22`)

**To get your private key:**
```bash
# On your local machine
cat ~/.ssh/id_ed25519
# Copy the entire output (including -----BEGIN and -----END lines)
```

#### 4. Initialize Git Repository on Server

```bash
# SSH into your server
ssh purelinen@your-server-ip

# Navigate to backend directory
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Initialize git if not already done
git init
git remote add origin https://github.com/your-username/purelinen_website.git
# OR if using SSH:
git remote add origin git@github.com:your-username/purelinen_website.git

# Pull the code
git pull origin main
```

#### 5. Test the Deployment

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to GitHub → **Actions** tab
4. Watch the deployment workflow run
5. Check your server logs:
   ```bash
   pm2 logs purelinen-backend
   ```

### Advanced: Environment-Specific Deployments

You can deploy to staging and production separately:

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches:
      - main      # Production
      - staging   # Staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            if [ "${{ github.ref }}" == "refs/heads/main" ]; then
              DEPLOY_PATH="/home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen"
            else
              DEPLOY_PATH="/home/purelinen/public_html/subdomains/staging/medusa-backend/purelinen"
            fi
            
            cd $DEPLOY_PATH
            git pull origin ${{ github.ref_name }}
            npm install --legacy-peer-deps
            npm run build
            pm2 restart purelinen-backend
```

## Option 2: GitHub Webhook + Simple Script

Simpler but less flexible - uses a webhook receiver on your server.

### Setup Steps

#### 1. Create Webhook Receiver Script

On your server, create `/home/purelinen/deploy-webhook.sh`:

```bash
#!/bin/bash

# Webhook receiver for GitHub deployments
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Pull latest code
git pull origin main

# Install dependencies
npm install --legacy-peer-deps

# Build
npm run build

# Restart PM2
pm2 restart purelinen-backend

echo "Deployment completed at $(date)"
```

Make it executable:
```bash
chmod +x /home/purelinen/deploy-webhook.sh
```

#### 2. Create PHP Webhook Receiver (for cPanel)

Create `/home/purelinen/public_html/webhook.php`:

```php
<?php
// GitHub Webhook Receiver
$secret = 'your-webhook-secret-here'; // Change this!

$headers = getallheaders();
$payload = file_get_contents('php://input');
$signature = $headers['X-Hub-Signature-256'] ?? '';

// Verify signature (optional but recommended)
$expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(401);
    die('Invalid signature');
}

// Execute deployment script
$output = shell_exec('/home/purelinen/deploy-webhook.sh 2>&1');
echo $output;
```

#### 3. Configure GitHub Webhook

1. Go to your GitHub repo → **Settings** → **Webhooks**
2. Click **Add webhook**
3. **Payload URL**: `https://your-domain.com/webhook.php`
4. **Content type**: `application/json`
5. **Secret**: Your webhook secret (same as in PHP file)
6. **Events**: Select "Just the push event"
7. **Active**: Checked
8. Click **Add webhook**

## Option 3: Manual Deployment Script

Create a simple script you can run manually:

```bash
#!/bin/bash
# deploy.sh - Manual deployment script

cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

echo "🔄 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building application..."
npm run build

echo "🚀 Restarting PM2..."
pm2 restart purelinen-backend

echo "✅ Deployment complete!"
pm2 status
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Option 4: Using PM2 Deploy (Built-in)

PM2 has a built-in deployment feature:

### Setup

1. **Create `ecosystem.config.js` with deploy config:**

```javascript
module.exports = {
  apps: [{
    name: 'purelinen-backend',
    script: 'npm',
    args: 'start',
    // ... your existing config
  }],
  
  deploy: {
    production: {
      user: 'purelinen',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/purelinen_website.git',
      path: '/home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen',
      'post-deploy': 'npm install --legacy-peer-deps && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
}
```

2. **Deploy:**

```bash
pm2 deploy ecosystem.config.js production
```

## Security Best Practices

1. **Use SSH keys, not passwords**
2. **Restrict SSH access** to specific IPs if possible
3. **Use webhook secrets** for webhook-based deployments
4. **Limit deployment user permissions** (don't use root)
5. **Review deployment logs** regularly
6. **Test deployments** on staging first

## Troubleshooting

### GitHub Actions fails with "Permission denied"

- Check SSH key is correctly added to GitHub secrets
- Verify SSH key is added to server's `~/.ssh/authorized_keys`
- Test SSH connection manually: `ssh purelinen@your-server-ip`

### Deployment runs but app doesn't restart

- Check PM2 is running: `pm2 status`
- Check logs: `pm2 logs purelinen-backend`
- Verify `.env` file exists and has correct values

### Build fails during deployment

- Check Node.js version on server matches workflow
- Verify all dependencies are in `package.json`
- Check build logs in GitHub Actions

## Recommended Approach

**For your setup, I recommend GitHub Actions** because:
- ✅ Fully automated
- ✅ Works with your existing GitHub repo
- ✅ Can see deployment history
- ✅ Easy to rollback
- ✅ Can add tests before deployment

Would you like me to help you set up GitHub Actions with your specific server details?
