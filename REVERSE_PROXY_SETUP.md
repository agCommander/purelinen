# Reverse Proxy Setup for cPanel/Apache

## Step-by-Step Guide

### 1. Create the Subdomain in cPanel

1. Log into **cPanel**
2. Go to **Subdomains** (under Domains section)
3. Create a new subdomain:
   - **Subdomain:** `api-new` (or your choice)
   - **Domain:** `purelinen.com.au`
   - **Document Root:** Leave default (usually `/home/username/api-new.purelinen.com.au/public_html`)
4. Click **Create**

### 2. Enable Required Apache Modules

SSH into your server and run:

```bash
# Enable required modules
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers

# Restart Apache
sudo systemctl restart httpd
# OR for some systems:
sudo systemctl restart apache2
```

**Note:** If `a2enmod` command doesn't work (some cPanel setups), you may need to edit Apache config directly or use WHM.

### 3. Configure Reverse Proxy via .htaccess

**Option A: Using cPanel File Manager (Easiest)**

1. In cPanel, go to **File Manager**
2. Navigate to: `/home/username/api-new.purelinen.com.au/public_html`
3. Click **+ File** → Create `.htaccess`
4. Paste this content:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy all requests to Node.js backend
    RewriteCond %{REQUEST_URI} !^/\.well-known/
    RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
</IfModule>

<IfModule mod_headers.c>
    # Pass through headers
    ProxyPreserveHost On
    ProxyPassReverse / http://localhost:9000/
    ProxyPassReverse / http://localhost:9000/
</IfModule>
```

5. Save the file

**Option B: Using SSH**

```bash
# Navigate to subdomain directory
cd /home/username/api-new.purelinen.com.au/public_html

# Create .htaccess file
nano .htaccess
```

Paste the same content as above, save and exit (Ctrl+X, Y, Enter).

### 4. Alternative: Configure via Apache Virtual Host (More Reliable)

If `.htaccess` doesn't work, configure directly in Apache:

**SSH into server:**

```bash
# Find your Apache config directory (usually one of these)
ls /etc/httpd/conf.d/
# OR
ls /etc/apache2/conf.d/
# OR in cPanel
ls /usr/local/apache/conf/userdata/

# Edit the subdomain's config file
sudo nano /etc/httpd/conf.d/api-new.purelinen.com.au.conf
# OR find it in cPanel's userdata directory
```

Add this configuration:

```apache
<VirtualHost *:80>
    ServerName api-new.purelinen.com.au
    ServerAlias www.api-new.purelinen.com.au
    
    # Proxy configuration
    ProxyPreserveHost On
    ProxyPass / http://localhost:9000/
    ProxyPassReverse / http://localhost:9000/
    
    # Headers
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Port "80"
</VirtualHost>

<VirtualHost *:443>
    ServerName api-new.purelinen.com.au
    ServerAlias www.api-new.purelinen.com.au
    
    # SSL configuration (if you have SSL)
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    # Proxy configuration
    ProxyPreserveHost On
    ProxyPass / http://localhost:9000/
    ProxyPassReverse / http://localhost:9000/
    
    # Headers
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
</VirtualHost>
```

**Restart Apache:**
```bash
sudo systemctl restart httpd
# OR
sudo systemctl restart apache2
```

### 5. Using cPanel's Application Manager (If Available)

Some cPanel installations have a **Node.js Selector** or **Application Manager**:

1. In cPanel, look for **Node.js Selector** or **Application Manager**
2. Create a new application:
   - **Domain:** `api-new.purelinen.com.au`
   - **Application Root:** `/home/username/api-new.purelinen.com.au`
   - **Application URL:** `/`
   - **Application Startup File:** `node_modules/@medusajs/medusa/cli.js start`
   - **Application Mode:** Production
3. This will automatically configure the reverse proxy

### 6. Test the Configuration

```bash
# Test from server
curl http://localhost:9000/health

# Test via subdomain (should return same result)
curl http://api-new.purelinen.com.au/health

# Test admin endpoint
curl http://api-new.purelinen.com.au/app
```

### 7. Install SSL Certificate

After reverse proxy is working:

1. In cPanel → **SSL/TLS Status**
2. Find `api-new.purelinen.com.au`
3. Click **Run AutoSSL** or **Install Let's Encrypt**
4. Wait for certificate installation
5. Test: `https://api-new.purelinen.com.au/health`

## Troubleshooting

### Error: "ProxyPass not allowed here"

This means Apache modules aren't enabled or `.htaccess` doesn't allow proxy directives.

**Solution:** Use Virtual Host configuration instead of `.htaccess` (see Option 4 above).

### Error: "Connection refused"

Check if your Node.js app is running:
```bash
pm2 status
curl http://localhost:9000/health
```

### Error: "Forbidden" or "403"

Check file permissions:
```bash
chmod 644 /home/username/api-new.purelinen.com.au/public_html/.htaccess
```

### Apache modules not enabling

In WHM:
1. Go to **Apache Configuration** → **Module Manager**
2. Enable:
   - `mod_rewrite`
   - `mod_proxy`
   - `mod_proxy_http`
   - `mod_headers`
3. Rebuild Apache configuration
4. Restart Apache

### Check Apache Error Logs

```bash
sudo tail -f /var/log/httpd/error_log
# OR
sudo tail -f /var/log/apache2/error.log
```

## Quick Reference

**Minimal .htaccess for reverse proxy:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
```

**Test commands:**
```bash
# Check if backend is running
pm2 status

# Test backend directly
curl http://localhost:9000/health

# Test via subdomain
curl http://api-new.purelinen.com.au/health
```

## Security Notes

- Port 9000 should only be accessible from localhost (not from internet)
- Use SSL/HTTPS for production
- Consider adding IP restrictions if needed
- Keep Apache and Node.js updated
