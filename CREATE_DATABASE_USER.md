# Create Database and User for Medusa

## Quick Steps

### 1. Connect to PostgreSQL as the postgres superuser

```bash
sudo -u postgres psql
```

You'll see a prompt like: `postgres=#`

### 2. Create the Database

```sql
CREATE DATABASE purelinen_medusa;
```

You should see: `CREATE DATABASE`

### 3. Create the User

```sql
CREATE USER medusa_user WITH PASSWORD 'your_secure_password_here';
```

**Important:** Replace `your_secure_password_here` with a strong password. Save this password - you'll need it for your `.env` file!

**Example:**
```sql
CREATE USER medusa_user WITH PASSWORD 'MySecureP@ssw0rd123!';
```

You should see: `CREATE ROLE`

### 4. Grant Permissions

```sql
GRANT ALL PRIVILEGES ON DATABASE purelinen_medusa TO medusa_user;
```

You should see: `GRANT`

### 5. Allow User to Create Databases (for migrations)

```sql
ALTER USER medusa_user CREATEDB;
```

You should see: `ALTER ROLE`

### 6. Exit PostgreSQL

```sql
\q
```

## Complete Example Session

Here's what your terminal session should look like:

```bash
[root@host ~]# sudo -u postgres psql
psql (15.5)
Type "help" for help.

postgres=# CREATE DATABASE purelinen_medusa;
CREATE DATABASE
postgres=# CREATE USER medusa_user WITH PASSWORD 'MySecureP@ssw0rd123!';
CREATE ROLE
postgres=# GRANT ALL PRIVILEGES ON DATABASE purelinen_medusa TO medusa_user;
GRANT
postgres=# ALTER USER medusa_user CREATEDB;
ALTER ROLE
postgres=# \q
[root@host ~]#
```

## Verify It Works

Test the connection:

```bash
psql -U medusa_user -d purelinen_medusa -h localhost
```

You'll be prompted for the password you just created. If it connects successfully, you'll see:

```
psql (15.5)
Type "help" for help.

purelinen_medusa=>
```

Type `\q` to exit.

## Save Your Credentials

**Important:** Write down these details - you'll need them for your `.env` file:

- **Database name:** `purelinen_medusa`
- **Username:** `medusa_user`
- **Password:** (the one you just created)
- **Host:** `localhost`
- **Port:** `5432` (default)

## Your DATABASE_URL Format

After creating the database and user, your `DATABASE_URL` in your `.env` file will be:

```
postgres://medusa_user:your_password@localhost:5432/purelinen_medusa
```

**Example:**
```
postgres://medusa_user:MySecureP@ssw0rd123!@localhost:5432/purelinen_medusa
```

## Troubleshooting

### Error: "password authentication failed"

If you get this error when testing, check:
1. Did you type the password correctly?
2. Is PostgreSQL configured to allow password authentication for localhost?

Check `pg_hba.conf`:
```bash
sudo cat /var/lib/pgsql/15/data/pg_hba.conf | grep -v "^#" | grep -v "^$"
```

Make sure you see:
```
host    all             all             127.0.0.1/32            scram-sha-256
```

### Error: "database does not exist"

Make sure you created the database:
```bash
sudo -u postgres psql -l
```

You should see `purelinen_medusa` in the list.

### Error: "role does not exist"

Make sure you created the user:
```bash
sudo -u postgres psql -c "\du"
```

You should see `medusa_user` in the list.

## Next Steps

After creating the database and user:

1. ✅ **Database created** - Done!
2. ⏭️ **Install Node.js 20+** - Next step
3. ⏭️ **Upload your code** - Deploy Medusa backend
4. ⏭️ **Configure `.env` file** - Use the DATABASE_URL format above
5. ⏭️ **Run migrations** - Medusa will create all tables
