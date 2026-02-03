# Steps 7 & 8: Database Migrations & PM2 Configuration

## Prerequisites Checklist

Before proceeding, make sure you have:

- [ ] **Node.js 20+ installed** - Check with: `node --version`
- [ ] **Code uploaded** to your server (e.g., `/home/username/purelinen_website/medusa-backend/purelinen`)
- [ ] **Dependencies installed** - Run: `npm install --production`
- [ ] **`.env` file created** with all required variables
- [ ] **Application built** - Run: `npm run build`
- [ ] **PM2 installed** - Run: `sudo npm install -g pm2`

## Step 7: Run Database Migrations

This will create all the necessary database tables for Medusa.

### Option A: Using npm start (Recommended for first time)

```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen

# Start the application - it will automatically run migrations
npm run start
```

**What to expect:**
- The application will start and connect to PostgreSQL
- Migrations will run automatically
- You'll see messages about creating tables
- Wait until you see "Server is ready" or similar message
- Then press `Ctrl+C` to stop it

### Option B: Using Medusa CLI

```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen

# Run migrations explicitly
npx medusa db:migrate
```

### Verify Migrations

Check that tables were created:

```bash
# Connect to PostgreSQL
sudo -u postgres psql -d purelinen_medusa

# List all tables
\dt

# You should see many tables like: user, customer, product, order, etc.
# Exit when done
\q
```

## Step 8: Configure PM2

PM2 will keep your Medusa backend running and restart it automatically.

### 1. Verify PM2 is Installed

```bash
pm2 --version
```

If not installed:
```bash
sudo npm install -g pm2
```

### 2. Check if ecosystem.config.js Exists

```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen
ls -la ecosystem.config.js
```

If it doesn't exist, create it:
```bash
nano ecosystem.config.js
```

Paste this content:
```javascript
module.exports = {
  apps: [
    {
      name: 'purelinen-backend',
      script: './node_modules/@medusajs/medusa/cli.js',
      args: 'start',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
    },
  ],
}
```

Save and exit (Ctrl+X, then Y, then Enter).

### 3. Create Logs Directory

```bash
mkdir -p logs
```

### 4. Start Application with PM2

```bash
cd /home/your_username/purelinen_website/medusa-backend/purelinen

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on server reboot
pm2 startup
```

**Important:** The `pm2 startup` command will output a command that you need to run as root. Copy and run that command!

Example output:
```
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your_username --hp /home/your_username
```

### 5. Verify PM2 is Running

```bash
# Check status
pm2 status

# View logs
pm2 logs purelinen-backend

# View real-time logs (press Ctrl+C to exit)
pm2 logs purelinen-backend --lines 50
```

### 6. Test Your Backend

Your backend should now be running on `http://localhost:9000`

Test it:
```bash
# Check if it's responding
curl http://localhost:9000/health

# Or check the admin endpoint
curl http://localhost:9000/app
```

## Useful PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs purelinen-backend

# Restart application
pm2 restart purelinen-backend

# Stop application
pm2 stop purelinen-backend

# View resource usage
pm2 monit

# Delete from PM2 (if needed)
pm2 delete purelinen-backend
```

## Troubleshooting

### Migrations fail with connection error

Check your `.env` file has the correct `DATABASE_URL`:
```bash
cat .env | grep DATABASE_URL
```

Test database connection:
```bash
psql -U medusa_user -d purelinen_medusa -h localhost
```

### PM2 app won't start

Check the logs:
```bash
pm2 logs purelinen-backend --lines 100
```

Check if port 9000 is already in use:
```bash
sudo netstat -tlnp | grep 9000
# or
sudo ss -tlnp | grep 9000
```

### Application crashes immediately

Check the error logs:
```bash
pm2 logs purelinen-backend --err
```

Common issues:
- Missing `.env` file
- Incorrect `DATABASE_URL`
- Missing dependencies (run `npm install --production`)
- Port already in use

## Next Steps

After completing Steps 7 & 8:

- ✅ **Step 9:** Configure Apache/Nginx Reverse Proxy
- ✅ **Step 10:** Set up SSL Certificate
- ✅ **Step 11:** Configure Firewall

Your backend should now be running and accessible at `http://localhost:9000`!
