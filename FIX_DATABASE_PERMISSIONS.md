# Fix Database Permissions

## The Error

```
permission denied for schema public
```

The `medusa_user` doesn't have permissions to create tables in the `public` schema.

## Fix: Grant Permissions

**In WHM Terminal:**

```bash
# Connect as postgres superuser
su - postgres

# Connect to the database
psql -d purelinen_medusa

# Grant all necessary permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO medusa_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medusa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medusa_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO medusa_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO medusa_user;

# Verify permissions
\dn+ public

# Exit
\q
exit
```

## One-Line Command

**In WHM Terminal:**

```bash
su - postgres -c "psql -d purelinen_medusa -c \"GRANT ALL PRIVILEGES ON SCHEMA public TO medusa_user; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medusa_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medusa_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO medusa_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO medusa_user;\""
```

## After Granting Permissions

**In cPanel Terminal:**

```bash
cd /home/purelinen/public_html/subdomains/newpl/medusa-backend/purelinen

# Set DATABASE_URL (if not already set)
export DATABASE_URL="postgres://medusa_user:x2X%216BubaYdZ4%26DrvP%23l@127.0.0.1:5432/purelinen_medusa"

# Try migration again
npx medusa db:migrate
```

## Verify Permissions

**In WHM Terminal:**

```bash
su - postgres
psql -d purelinen_medusa -c "\dn+ public"
exit
```

This should show `medusa_user` has usage and create privileges.

Run the permission grant commands, then try the migration again!
