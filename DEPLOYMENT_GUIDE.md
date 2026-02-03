# Deployment Guide for WHM/cPanel VPS

This guide will help you deploy your Medusa backend to a WHM/cPanel VPS server.

## Prerequisites Checklist

- [ ] WHM/cPanel access
- [ ] SSH access to your VPS
- [ ] Root or sudo access (for PostgreSQL installation)
- [ ] Domain/subdomain for your backend (e.g., `api.purelinen.com.au`)
- [ ] AWS SES credentials (for email sending)

## Step 1: Install PostgreSQL

### Option A: Install via cPanel (if available)

1. Log into **WHM** (not cPanel)
2. Navigate to **Software** → **PostgreSQL Manager** (if available)
3. Install PostgreSQL 14 or higher
4. Create a database and user

### Option B: Install PostgreSQL Manually (Recommended)

**First, identify your Linux distribution:**

SSH into your server and run:
```bash
cat /etc/os-release
# OR
cat /etc/redhat-release
# OR
lsb_release -a
```

**Then install PostgreSQL based on your OS:**

#### For CentOS/RHEL 7/8/9, AlmaLinux, Rocky Linux:

**Method 1: Using PostgreSQL Official Repository (Recommended)**
```bash
# Install PostgreSQL repository
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-$(rpm -E %{rhel})-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Install PostgreSQL 15
sudo yum install -y postgresql15-server postgresql15

# Initialize database
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

**Method 2: Using EPEL Repository**
```bash
# Install EPEL repository
sudo yum install -y epel-release

# Try installing PostgreSQL (version may vary)
sudo yum install -y postgresql-server postgresql

# Initialize database
sudo postgresql-setup initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### For CentOS/RHEL 6 or older:
```bash
sudo yum install -y postgresql-server postgresql
sudo service postgresql initdb
sudo service postgresql start
sudo chkconfig postgresql on
```

#### For Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# PostgreSQL will start automatically
# Check status:
sudo systemctl status postgresql
```

#### For Amazon Linux 2:
```bash
sudo yum install -y postgresql-server postgresql
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### If none of the above work, try:
```bash
# Check what PostgreSQL packages are available
yum search postgresql
# OR
apt-cache search postgresql

# Install whatever version is available (usually postgresql-server or postgresql)
sudo yum install -y postgresql-server postgresql
# OR
sudo apt-get install -y postgresql postgresql-contrib
```

### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE purelinen_medusa;
CREATE USER medusa_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE purelinen_medusa TO medusa_user;
\q
```

**Note:** Replace `your_secure_password_here` with a strong password. Save this password - you'll need it for `DATABASE_URL`.

## Step 2: Install Node.js 20+

### Option A: Using NodeSource Repository (Recommended)

```bash
# For CentOS/RHEL/AlmaLinux
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x or higher
npm --version
```

### Option B: Using NVM (Node Version Manager)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version
```

## Step 3: Install PM2 (Process Manager)

PM2 will keep your Medusa backend running and restart it automatically if it crashes.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

## Step 4: Prepare Your Application

### Upload Your Code

You can either:

**Option A: Git Clone (Recommended)**
```bash
cd /home/your_username
git clone https://github.com/your-username/purelinen_website.git
cd purelinen_website/medusa-backend/purelinen
```

**Option B: Upload via FTP/SFTP**
- Upload your project files to `/home/your_username/purelinen_website/medusa-backend/purelinen`

### Install Dependencies

```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen
npm install --production
```

## Step 5: Configure Environment Variables

Create a `.env` file in `medusa-backend/purelinen/`:

```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen
nano .env
```

**Important:** The `.env` file should NOT be committed to git. It contains sensitive credentials.

**Note:** If you're using cPanel File Manager, you can create the `.env` file there, but make sure it starts with a dot (`.env`). You may need to enable "Show Hidden Files" in File Manager settings.

Add the following (replace with your actual values):

```env
# Database
DATABASE_URL=postgres://medusa_user:your_secure_password_here@localhost:5432/purelinen_medusa

# CORS (replace with your actual domains)
STORE_CORS=https://purelinen.com.au,https://www.purelinen.com.au,https://linenthings.com.au,https://www.linenthings.com.au
ADMIN_CORS=https://api.purelinen.com.au
AUTH_CORS=https://api.purelinen.com.au

# Security (generate strong random strings)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
COOKIE_SECRET=your_super_secret_cookie_key_here_min_32_chars

# Stripe (if using)
STRIPE_API_KEY=sk_live_your_stripe_key_here

# AWS SES (for email)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_SES_FROM_EMAIL=noreply@purelinen.com.au

# Environment
NODE_ENV=production
```

**Generate secure secrets:**
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate COOKIE_SECRET
openssl rand -base64 32
```

## Step 6: Build the Application

```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen
npm run build
```

## Step 7: Run Database Migrations

```bash
# This will create all necessary tables
npm run start
# Wait for migrations to complete, then Ctrl+C to stop
```

Or use Medusa CLI:
```bash
npx medusa db:migrate
```

## Step 8: Configure PM2

Create a PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Use the provided `ecosystem.config.js` file (see below).

Start the application with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The last command will show you a command to run as root - copy and run it to enable PM2 on server restart.

## Step 9: Configure Apache/Nginx Reverse Proxy

### For Apache (cPanel default)

**Option 1: Using cPanel Subdomain (Recommended)**

1. In cPanel, go to **Subdomains**
2. Create a subdomain (e.g., `api.purelinen.com.au`)
3. Note the document root path (usually `/home/username/api.purelinen.com.au/public_html`)
4. Edit the `.htaccess` file or create a new one in the subdomain's document root:

**Option 2: Using cPanel Application Manager**

Some cPanel installations have a "Node.js Selector" or "Application Manager" that can handle Node.js apps directly. Check if this is available in your cPanel.

**Manual Apache Configuration:**

Edit the `.htaccess` file or create a new one in the subdomain's document root:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy to Node.js app running on port 9000
    RewriteCond %{REQUEST_URI} !^/\.well-known/
    RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
</IfModule>
```

**Enable required Apache modules:**
```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2  # or httpd on CentOS
```

### For Nginx (if available)

Create a new server block:

```nginx
server {
    listen 80;
    server_name api.purelinen.com.au;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Step 10: Set Up SSL Certificate

In cPanel:
1. Go to **SSL/TLS Status**
2. Install a Let's Encrypt certificate for your subdomain
3. Force HTTPS redirect

Or use Certbot:
```bash
sudo certbot --apache -d api.purelinen.com.au
```

## Step 11: Configure Firewall

Allow PostgreSQL and Node.js ports:

```bash
# For firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=9000/tcp
sudo firewall-cmd --reload

# For UFW (Ubuntu)
sudo ufw allow 9000/tcp
```

**Note:** Port 9000 should only be accessible from localhost (via reverse proxy), not from the internet.

## Step 12: Monitor Your Application

```bash
# View logs
pm2 logs purelinen-backend

# View status
pm2 status

# Restart application
pm2 restart purelinen-backend

# View resource usage
pm2 monit
```

## Troubleshooting

### Check if PostgreSQL is running
```bash
sudo systemctl status postgresql
```

### Check PostgreSQL connection
```bash
psql -U medusa_user -d purelinen_medusa -h localhost
```

### Check Node.js app logs
```bash
pm2 logs purelinen-backend --lines 100
```

### Check if port 9000 is in use
```bash
sudo netstat -tlnp | grep 9000
# or
sudo ss -tlnp | grep 9000
```

### Test database connection from Node.js
```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen
node -e "const pg = require('pg'); const client = new pg.Client(process.env.DATABASE_URL); client.connect().then(() => console.log('Connected!')).catch(e => console.error(e));"
```

## Security Checklist

- [ ] PostgreSQL is not accessible from the internet (only localhost)
- [ ] Strong passwords for database user
- [ ] Strong JWT_SECRET and COOKIE_SECRET
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] PM2 running as non-root user
- [ ] Environment variables not committed to git
- [ ] Regular backups configured

## Next Steps

1. **Set up automated backups** for your PostgreSQL database
2. **Configure monitoring** (e.g., PM2 Plus, or external monitoring service)
3. **Set up log rotation** for PM2 logs
4. **Configure email sending** with AWS SES
5. **Deploy your storefronts** (Pure Linen and Linen Things)

## Useful Commands

```bash
# Restart backend
pm2 restart purelinen-backend

# Stop backend
pm2 stop purelinen-backend

# View real-time logs
pm2 logs purelinen-backend

# Database backup
pg_dump -U medusa_user purelinen_medusa > backup_$(date +%Y%m%d).sql

# Database restore
psql -U medusa_user purelinen_medusa < backup_20240101.sql
```
