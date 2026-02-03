# Check PM2 Logs for Errors

## The Problem

PM2 shows the process is restarting repeatedly (↺ 9), which means the app is crashing. Check logs to see why.

## Check Logs

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check error logs
pm2 logs purelinen-backend --err --lines 50

# Or check the log files directly
tail -50 logs/pm2-error.log

# Check output logs
tail -50 logs/pm2-out.log

# Check combined logs
tail -50 logs/pm2-combined.log
```

## Common Issues

### Issue 1: Missing Dependencies

If you see module not found errors:
```bash
npm install --legacy-peer-deps
```

### Issue 2: Database Connection Issues

If you see database connection errors, verify DATABASE_URL is set correctly in ecosystem.config.js

### Issue 3: Port Already in Use

If port 9000 is already in use:
```bash
# Check what's using port 9000
lsof -i :9000

# Or change port in ecosystem.config.js
```

### Issue 4: Build Required

If you see "Cannot find module" errors, you might need to build:
```bash
npm run build
```

## Quick Diagnostic

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Check recent errors
pm2 logs purelinen-backend --err --lines 30

# Check if app is actually starting
pm2 describe purelinen-backend
```

Check the logs and share the error messages - that will tell us what's wrong!
