# Quick Deployment Reference

## TL;DR - Fastest Path to Deployment

### 1. Install PostgreSQL

**First, identify your OS:**
```bash
cat /etc/os-release
```

**Then install:**

**CentOS/RHEL/AlmaLinux/Rocky (with PostgreSQL repo):**
```bash
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-$(rpm -E %{rhel})-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo yum install -y postgresql15-server postgresql15
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

**CentOS/RHEL (with EPEL - fallback):**
```bash
sudo yum install -y epel-release
sudo yum install -y postgresql-server postgresql
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**If packages not found, check available versions:**
```bash
yum search postgresql
# Then install whatever is available (usually postgresql-server)
```

### 2. Create Database
```bash
sudo -u postgres psql
CREATE DATABASE purelinen_medusa;
CREATE USER medusa_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE purelinen_medusa TO medusa_user;
\q
```

### 3. Install Node.js 20+
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
# OR for Ubuntu:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. Install PM2
```bash
sudo npm install -g pm2
```

### 5. Setup Application
```bash
cd /path/to/purelinen_website/medusa-backend/purelinen
npm install --production
```

### 6. Create .env File
```bash
nano .env
```

Paste this (update with your values):
```env
DATABASE_URL=postgres://medusa_user:your_password@localhost:5432/purelinen_medusa
STORE_CORS=https://purelinen.com.au,https://www.purelinen.com.au,https://linenthings.com.au,https://www.linenthings.com.au
ADMIN_CORS=https://api.purelinen.com.au
AUTH_CORS=https://api.purelinen.com.au
JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=9000
```

### 7. Build & Deploy
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions shown
```

### 8. Configure Reverse Proxy

**Apache (.htaccess in subdomain root):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
```

**Enable modules:**
```bash
sudo a2enmod rewrite proxy proxy_http
sudo systemctl restart apache2
```

### 9. SSL Certificate
- Use cPanel's SSL/TLS Status to install Let's Encrypt
- Or use Certbot: `sudo certbot --apache -d api.purelinen.com.au`

## Common Issues

**PostgreSQL not found in cPanel:**
- Install manually via SSH (see Step 1 above)

**Port 9000 already in use:**
```bash
sudo lsof -i :9000
# Kill the process or change PORT in .env
```

**PM2 app won't start:**
```bash
pm2 logs purelinen-backend
# Check for errors in the logs
```

**Database connection failed:**
```bash
# Test connection
psql -U medusa_user -d purelinen_medusa -h localhost
# Check PostgreSQL is running
sudo systemctl status postgresql
```

## Environment Variables Checklist

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `STORE_CORS` - Comma-separated storefront URLs
- [ ] `ADMIN_CORS` - Backend admin URL
- [ ] `AUTH_CORS` - Backend auth URL
- [ ] `JWT_SECRET` - Random 32+ character string
- [ ] `COOKIE_SECRET` - Random 32+ character string
- [ ] `NODE_ENV=production`
- [ ] `PORT=9000` (or your preferred port)

## Useful Commands

```bash
# View logs
pm2 logs purelinen-backend

# Restart
pm2 restart purelinen-backend

# Status
pm2 status

# Monitor
pm2 monit

# Database backup
pg_dump -U medusa_user purelinen_medusa > backup.sql

# Database restore
psql -U medusa_user purelinen_medusa < backup.sql
```
