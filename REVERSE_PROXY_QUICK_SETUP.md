# Reverse Proxy Quick Setup Guide

## Step 1: Update Build Script ✅ DONE

The `package.json` build script has been updated to automatically copy admin files:
```json
"build": "medusa build && mkdir -p public/admin && cp -r .medusa/client/* public/admin/"
```

**Next time you deploy**, the build will automatically copy files to the correct location.

## Step 2: Enable Apache Modules

**In WHM Terminal (as root):**

```bash
# Check if modules are already enabled
httpd -M | grep -E "rewrite|proxy|headers"

# If not enabled, enable them via WHM:
# 1. Go to WHM → Apache Configuration → Module Manager
# 2. Enable these modules:
#    - mod_rewrite
#    - mod_proxy
#    - mod_proxy_http
#    - mod_headers
# 3. Click "Rebuild Configuration"
# 4. Restart Apache
```

**Or via SSH (if you have root access):**
```bash
# For AlmaLinux/CentOS/cPanel
# Modules are usually already enabled, but verify:
httpd -M | grep proxy
httpd -M | grep rewrite

# Restart Apache if needed
systemctl restart httpd
```

## Step 3: Create/Configure Subdomain

**In cPanel:**

1. Go to **Subdomains** (under Domains)
2. Create subdomain (if not already created):
   - **Subdomain:** `api-new` (or your preferred name)
   - **Domain:** `purelinen.com.au`
   - **Document Root:** `/home/purelinen/api-new.purelinen.com.au/public_html`
3. Click **Create**

## Step 4: Create .htaccess File

**Option A: Using cPanel File Manager (Easiest)**

1. In cPanel → **File Manager**
2. Navigate to: `/home/purelinen/api-new.purelinen.com.au/public_html`
3. Click **+ File** → Name it `.htaccess`
4. Paste this content:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy all requests to Node.js backend
    RewriteCond %{REQUEST_URI} !^/\.well-known/
    RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
</IfModule>
```

5. Click **Save**

**Option B: Using SSH (cPanel Terminal)**

```bash
cd /home/purelinen/api-new.purelinen.com.au/public_html

cat > .htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy all requests to Node.js backend
    RewriteCond %{REQUEST_URI} !^/\.well-known/
    RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
</IfModule>
EOF

# Set correct permissions
chmod 644 .htaccess
```

## Step 5: Test the Reverse Proxy

**On the server (cPanel Terminal):**

```bash
# 1. Verify backend is running
pm2 status

# 2. Test backend directly (should work)
curl http://localhost:9000/health

# 3. Test via subdomain (should return same result)
curl http://api-new.purelinen.com.au/health

# 4. Test admin endpoint
curl -I http://api-new.purelinen.com.au/app
```

**Expected results:**
- `curl http://localhost:9000/health` → `OK`
- `curl http://api-new.purelinen.com.au/health` → `OK` (same result)
- Admin endpoint should return HTTP 200

## Step 6: Install SSL Certificate

**In cPanel:**

1. Go to **SSL/TLS Status**
2. Find `api-new.purelinen.com.au` in the list
3. Click **Run AutoSSL** or **Install Let's Encrypt**
4. Wait for certificate installation (usually 1-2 minutes)
5. Test: `curl https://api-new.purelinen.com.au/health`

## Troubleshooting

### If `.htaccess` doesn't work:

**Try Virtual Host configuration instead:**

1. In WHM → **Apache Configuration** → **Include Editor**
2. Select **Pre VirtualHost Include** → **All Versions**
3. Add this configuration:

```apache
<VirtualHost *:80>
    ServerName api-new.purelinen.com.au
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:9000/
    ProxyPassReverse / http://localhost:9000/
    
    RequestHeader set X-Forwarded-Proto "http"
</VirtualHost>
```

4. Click **Save**
5. Restart Apache

### If you get "Connection refused":

```bash
# Check if PM2 is running
pm2 status

# Check if port 9000 is listening
netstat -tlnp | grep 9000
# OR
ss -tlnp | grep 9000

# Restart backend if needed
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
pm2 restart purelinen-backend
```

### If you get "Forbidden" or "403":

```bash
# Check .htaccess permissions
ls -la /home/purelinen/api-new.purelinen.com.au/public_html/.htaccess

# Fix permissions if needed
chmod 644 /home/purelinen/api-new.purelinen.com.au/public_html/.htaccess
```

### Check Apache error logs:

```bash
# View recent errors
tail -50 /var/log/httpd/error_log
# OR
tail -50 /usr/local/apache/logs/error_log
```

## Quick Test Checklist

- [ ] Apache modules enabled (`mod_rewrite`, `mod_proxy`, `mod_proxy_http`)
- [ ] Subdomain created in cPanel
- [ ] `.htaccess` file created in subdomain's `public_html`
- [ ] Backend running via PM2 (`pm2 status` shows "online")
- [ ] `curl http://localhost:9000/health` returns `OK`
- [ ] `curl http://api-new.purelinen.com.au/health` returns `OK`
- [ ] SSL certificate installed
- [ ] `curl https://api-new.purelinen.com.au/health` returns `OK`

## Next Steps After Setup

1. **Update your storefront `.env.local`** to point to the new API URL:
   ```
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-new.purelinen.com.au
   ```

2. **Update backend `.env` CORS settings** if needed:
   ```
   STORE_CORS=https://newpl.purelinen.com.au,https://newlt.linenthings.com.au
   ADMIN_CORS=https://api-new.purelinen.com.au
   AUTH_CORS=https://api-new.purelinen.com.au
   ```

3. **Rebuild and restart backend** after CORS changes:
   ```bash
   cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen
   npm run build
   pm2 restart purelinen-backend
   ```
