# GitHub Secrets Setup Guide

## Step-by-Step Instructions

### Step 1: Generate SSH Key (If You Don't Have One)

**On your local machine (Mac/Linux):**

```bash
# Generate a new SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# If ed25519 is not supported, use RSA instead:
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

**You'll be asked:**
- "Enter passphrase" - Press Enter (no passphrase needed for automation)
- "Enter same passphrase again" - Press Enter

**This creates two files:**
- `~/.ssh/github_actions_deploy` - **Private key** (keep secret!)
- `~/.ssh/github_actions_deploy.pub` - **Public key** (safe to share)

### Step 2: Add Public Key to Your Server

**Copy your public key:**

```bash
# Display the public key
cat ~/.ssh/github_actions_deploy.pub
```

**Copy the entire output** (it starts with `ssh-ed25519` or `ssh-rsa`)

**On your server, add it to authorized_keys:**

```bash
# SSH into your server
ssh purelinen@your-server-ip

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key
echo "paste-your-public-key-here" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

**Or use ssh-copy-id (easier):**

```bash
# From your local machine
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub purelinen@your-server-ip
```

### Step 3: Test SSH Connection

**From your local machine:**

```bash
# Test SSH connection
ssh -i ~/.ssh/github_actions_deploy purelinen@your-server-ip

# If it works, you'll be logged into your server
# Type 'exit' to disconnect
```

### Step 4: Get Your Private Key Content

**On your local machine:**

```bash
# Display the private key (copy the ENTIRE output)
cat ~/.ssh/github_actions_deploy
```

**Important:** Copy everything including:
- `-----BEGIN OPENSSH PRIVATE KEY-----` (or `-----BEGIN RSA PRIVATE KEY-----`)
- All the lines in between
- `-----END OPENSSH PRIVATE KEY-----` (or `-----END RSA PRIVATE KEY-----`)

### Step 5: Add Secrets to GitHub

**In GitHub, you're at: Settings → Secrets and variables → Actions**

#### Secret 1: SSH_HOST

1. Click **"New repository secret"**
2. **Name:** `SSH_HOST`
3. **Secret:** Your server IP address or hostname
   - Example: `123.45.67.89`
   - Or: `host.purelinen.com.au`
   - Or: `api-new.purelinen.com.au`
4. Click **"Add secret"**

#### Secret 2: SSH_USER

1. Click **"New repository secret"** again
2. **Name:** `SSH_USER`
3. **Secret:** Your SSH username
   - Example: `purelinen`
   - (The username you use to SSH into the server)
4. Click **"Add secret"**

#### Secret 3: SSH_PRIVATE_KEY

1. Click **"New repository secret"** again
2. **Name:** `SSH_PRIVATE_KEY`
3. **Secret:** Paste the **ENTIRE** private key content
   - This is what you copied from `cat ~/.ssh/github_actions_deploy`
   - Include the BEGIN and END lines
   - Should look like:
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
     ... (many lines) ...
     -----END OPENSSH PRIVATE KEY-----
     ```
4. Click **"Add secret"**

#### Secret 4: SSH_PORT

1. Click **"New repository secret"** again
2. **Name:** `SSH_PORT`
3. **Secret:** Your SSH port number
   - Usually: `22` (default)
   - If you changed it, use your custom port
4. Click **"Add secret"**

### Step 6: Verify Secrets Are Added

You should now see 4 secrets listed:
- ✅ SSH_HOST
- ✅ SSH_USER
- ✅ SSH_PRIVATE_KEY
- ✅ SSH_PORT

## Quick Reference: What Values to Use

| Secret Name | What to Enter | Example |
|------------|---------------|---------|
| `SSH_HOST` | Server IP or domain | `123.45.67.89` or `host.purelinen.com.au` |
| `SSH_USER` | SSH username | `purelinen` |
| `SSH_PRIVATE_KEY` | Full private key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_PORT` | SSH port number | `22` |

## Troubleshooting

### "Permission denied" when testing SSH

1. **Check file permissions:**
   ```bash
   chmod 600 ~/.ssh/github_actions_deploy
   chmod 644 ~/.ssh/github_actions_deploy.pub
   ```

2. **Verify public key is on server:**
   ```bash
   ssh purelinen@your-server-ip
   cat ~/.ssh/authorized_keys
   # Should see your public key
   ```

3. **Check SSH config on server:**
   ```bash
   # On server
   cat /etc/ssh/sshd_config | grep -i "PubkeyAuthentication"
   # Should be: PubkeyAuthentication yes
   ```

### "Host key verification failed"

Add your server to known_hosts:
```bash
ssh-keyscan -H your-server-ip >> ~/.ssh/known_hosts
```

### Can't find your server IP/hostname

**Find your server IP:**
```bash
# On your server
hostname -I
# OR
ip addr show
```

**Or check your cPanel:**
- cPanel → **Server Information** → Look for "Shared IP Address"

## Security Notes

⚠️ **Important:**
- Never commit your private key to Git
- Never share your private key publicly
- The private key is stored encrypted in GitHub Secrets
- Only people with repo access can see/use these secrets
- Consider using a dedicated deployment user (not your main user)

## Next Steps

After adding all 4 secrets:

1. ✅ **Initialize Git on your server** (if not done)
2. ✅ **Test the deployment** by pushing code
3. ✅ **Check GitHub Actions** tab to see deployment status

## Testing the Setup

Once secrets are added, you can test by:

1. Making a small change to your code
2. Committing and pushing:
   ```bash
   git add .
   git commit -m "Test automated deployment"
   git push origin main
   ```
3. Go to GitHub → **Actions** tab
4. Watch the workflow run
5. Check your server: `pm2 logs purelinen-backend`

---

**Need help with any step?** Let me know which part you're stuck on!
