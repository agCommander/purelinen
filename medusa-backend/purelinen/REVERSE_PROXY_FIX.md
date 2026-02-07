# Critical Fix for Session Cookies Behind Reverse Proxy

## The Problem
Session cookies aren't working because Medusa doesn't know it's behind a reverse proxy (Apache). It needs to:
1. Trust the proxy (know it's behind Apache)
2. Receive the `X-Forwarded-Proto` header (to know it's HTTPS)
3. Set cookies with correct `secure` flag

## Solution

### 1. Update `.htaccess` File (CRITICAL)

**Location:** `/home/purelinen/public_html/api-new/.htaccess`

**Current content** (if it exists):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
</IfModule>
```

**Updated content** (add these headers):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy all requests to Node.js backend
    RewriteCond %{REQUEST_URI} !^/\.well-known/
    RewriteRule ^(.*)$ http://localhost:9000/$1 [P,L]
</IfModule>

<IfModule mod_headers.c>
    # CRITICAL: Tell Medusa the original request was HTTPS
    # This allows Medusa to set cookies with Secure flag correctly
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Host "api-new.purelinen.com.au"
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}e"
</IfModule>
```

### 2. Update Medusa Config (Already Done)

The `medusa-config.ts` has been updated with:
- `secure: process.env.NODE_ENV === 'production'` - will be `true` in production
- `sameSite: "lax"` - correct for same-domain requests
- `cookieOptions.domain` - can be set via `COOKIE_DOMAIN` env var if needed

### 3. Set Environment Variable (Optional)

If you need to set a cookie domain, add to `.env`:
```
COOKIE_DOMAIN=.purelinen.com.au
```

**Note:** Usually not needed for same-domain requests.

### 4. Verify NODE_ENV

Make sure `NODE_ENV=production` is set in your `.env` file so cookies use `Secure` flag.

## Why This Works

1. **X-Forwarded-Proto: https** - Tells Medusa the original request was HTTPS, so it sets `Secure` flag on cookies
2. **X-Forwarded-Host** - Tells Medusa the original hostname
3. **secure: true in production** - Cookies will have `Secure` flag when `NODE_ENV=production`

## Testing

After updating `.htaccess`:
1. Restart Apache (if you have access) OR just wait for changes to take effect
2. Clear browser cookies for the site
3. Try logging in again
4. Check browser DevTools → Network → Response Headers for `Set-Cookie`
5. Verify cookie has `Secure` flag (if HTTPS) and `SameSite=Lax`

## If It Still Doesn't Work

Check Medusa's internal Express app configuration. Medusa v2 might need `trust proxy` set differently. You may need to:
- Contact Medusa support
- Check Medusa v2 documentation for reverse proxy setup
- Look for a way to configure Express `app.set('trust proxy', 1)` in Medusa v2
