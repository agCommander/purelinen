# PostgreSQL Access Configuration

## Important: Do You Need Remote Access?

**For Medusa deployment, you typically DON'T need remote access** because:
- Your Medusa backend runs on the same server as PostgreSQL
- It connects via `localhost` (127.0.0.1)
- This is more secure - PostgreSQL won't be exposed to the internet

**Only configure remote access if:**
- You want to connect from your local machine for database management
- You have multiple servers that need database access
- You're using a database management tool from another machine

## Option 1: Localhost-Only Access (Recommended for Medusa)

This is the default and most secure. Your Medusa backend will connect via `localhost`.

**Verify it's working:**
```bash
# Test connection from command line
psql -U medusa_user -d purelinen_medusa -h localhost
```

If this works, you're all set! No configuration needed.

## Option 2: Configure for Localhost with Password (Current Setup)

If you're having connection issues, ensure `pg_hba.conf` allows localhost connections:

```bash
# Edit pg_hba.conf
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

Make sure these lines exist (they should be there by default):

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256

# Or if using md5 (older method):
host    all             all             127.0.0.1/32            md5
```

**Check postgresql.conf:**
```bash
sudo nano /var/lib/pgsql/15/data/postgresql.conf
```

Find and ensure this line is set:
```
listen_addresses = 'localhost'
```

**Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql-15
```

## Option 3: Enable Remote Access (NOT Recommended for Production)

⚠️ **Security Warning:** Only do this if you absolutely need remote access and understand the security implications.

### Step 1: Edit postgresql.conf

```bash
sudo nano /var/lib/pgsql/15/data/postgresql.conf
```

Find and change:
```
listen_addresses = 'localhost'
```

To:
```
listen_addresses = '*'  # Listen on all interfaces
# OR specify specific IPs:
# listen_addresses = 'localhost,192.168.1.100'
```

### Step 2: Edit pg_hba.conf

```bash
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

Add a line for remote connections (at the end of the file):
```
# Remote connections (replace YOUR_IP with your actual IP or use 0.0.0.0/0 for all - NOT RECOMMENDED)
host    all             all             YOUR_IP/32            scram-sha-256
```

**Example for specific IP:**
```
host    all             all             192.168.1.100/32       scram-sha-256
```

**Example for specific network:**
```
host    all             all             192.168.1.0/24         scram-sha-256
```

### Step 3: Restart PostgreSQL

```bash
sudo systemctl restart postgresql-15
```

### Step 4: Configure Firewall

Allow PostgreSQL port (5432) only from trusted IPs:

```bash
# For firewalld (CentOS/RHEL/AlmaLinux)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="YOUR_IP" port port="5432" protocol="tcp" accept'
sudo firewall-cmd --reload

# For UFW (Ubuntu)
sudo ufw allow from YOUR_IP to any port 5432
```

**NEVER open port 5432 to 0.0.0.0/0 (all IPs) unless you use a VPN or SSH tunnel!**

## Option 4: Use SSH Tunnel (Recommended for Remote Access)

Instead of opening PostgreSQL to the internet, use an SSH tunnel:

**From your local machine:**
```bash
ssh -L 5432:localhost:5432 username@your-server-ip
```

Then connect using:
```
postgres://medusa_user:password@localhost:5432/purelinen_medusa
```

This is much more secure than opening PostgreSQL to the internet.

## Testing Your Configuration

### Test Localhost Connection:
```bash
psql -U medusa_user -d purelinen_medusa -h localhost
```

### Test Remote Connection (if configured):
```bash
# From another machine
psql -U medusa_user -d purelinen_medusa -h your-server-ip
```

## Troubleshooting Connection Issues

### Error: "password authentication failed"

Check `pg_hba.conf` authentication method:
```bash
sudo cat /var/lib/pgsql/15/data/pg_hba.conf | grep -v "^#"
```

Make sure it uses `scram-sha-256` or `md5`, not `ident` or `peer` for TCP connections.

### Error: "could not connect to server"

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql-15
   ```

2. Check `listen_addresses` in `postgresql.conf`:
   ```bash
   sudo grep listen_addresses /var/lib/pgsql/15/data/postgresql.conf
   ```

3. Check firewall:
   ```bash
   sudo firewall-cmd --list-all
   # or
   sudo iptables -L -n
   ```

### Error: "connection refused"

- PostgreSQL might not be listening on the expected address
- Firewall might be blocking the connection
- Check `listen_addresses` in `postgresql.conf`

## Recommended Configuration for Medusa

**For your Medusa deployment, use this:**

1. ✅ Keep `listen_addresses = 'localhost'` in `postgresql.conf`
2. ✅ Ensure `pg_hba.conf` has localhost entries
3. ✅ Use `DATABASE_URL=postgres://medusa_user:password@localhost:5432/purelinen_medusa`
4. ✅ Don't open PostgreSQL port in firewall
5. ✅ Use SSH tunnel if you need remote database access

This is the most secure setup!
