# Single Storefront Approach

## Overview

This project uses a **single codebase** for both Pure Linen and Linen Things storefronts. Site-specific differences are controlled via environment variables and conditional rendering using `IS_PURELINEN` / `IS_LINENTHINGS` flags.

## Architecture

- **One Codebase**: `medusa-storefront/purelinen/` contains all code
- **Two Deployments**: Deploy the same codebase twice with different environment variables
- **Single Backend**: One Medusa backend serves both storefronts

## Environment Variables

Set `NEXT_PUBLIC_SITE_BRAND` (or `NEXT_PUBLIC_STORE_NAME` for backward compatibility) to determine which site is running:

- `NEXT_PUBLIC_SITE_BRAND=purelinen` - Pure Linen website
- `NEXT_PUBLIC_SITE_BRAND=linenthings` - Linen Things website

## Local Development

### Start Pure Linen Frontend
```bash
./start-fe.sh
# Runs on http://localhost:8001 with NEXT_PUBLIC_SITE_BRAND=purelinen
```

### Start Linen Things Frontend
```bash
./start-ltfe.sh
# Runs on http://localhost:8000 with NEXT_PUBLIC_SITE_BRAND=linenthings
```

Both scripts use the same codebase (`medusa-storefront/purelinen/`) but set different environment variables.

## Using Site Config in Code

Import and use the site configuration:

```typescript
import { 
  SITE_NAME, 
  IS_PURELINEN, 
  IS_LINENTHINGS,
  getSiteConfig,
  getSiteValue 
} from '@/lib/config/site-config'

// Get site name
const siteName = SITE_NAME // 'purelinen' or 'linenthings'

// Use boolean flags
if (IS_PURELINEN) {
  // Pure Linen specific code
}

if (IS_LINENTHINGS) {
  // Linen Things specific code
}

// Get site config
const config = getSiteConfig()
const logo = config.logo // '/images/PL_logo.png' or '/images/LT_Logo.png'
const siteName = config.name // 'Pure Linen' or 'Linen Things'

// Get site-specific values
const logo = getSiteValue('/images/PL_logo.png', '/images/LT_Logo.png')
```

## Examples

### Conditional Rendering
```typescript
import { IS_PURELINEN } from '@/lib/config/site-config'

{IS_PURELINEN ? (
  <PureLinenComponent />
) : (
  <LinenThingsComponent />
)}
```

### Site-Specific Logo
```typescript
import { getSiteConfig } from '@/lib/config/site-config'

const siteConfig = getSiteConfig()
const logoSrc = siteConfig.logo
```

### Conditional Cart Visibility
```typescript
import { IS_LINENTHINGS, IS_PURELINEN } from '@/lib/config/site-config'

const shouldShowCart = IS_LINENTHINGS || (IS_PURELINEN && isLoggedIn)
```

## Deployment

### Deploy Pure Linen
Set environment variable:
```env
NEXT_PUBLIC_SITE_BRAND=purelinen
```

### Deploy Linen Things
Set environment variable:
```env
NEXT_PUBLIC_SITE_BRAND=linenthings
```

Both deployments use the same codebase, just with different environment variables.

## Benefits

1. **Single Source of Truth** - One codebase to maintain
2. **No Code Duplication** - Changes apply to both sites automatically
3. **Easy Maintenance** - Fix bugs once, works everywhere
4. **Site-Specific Behavior** - Use `IS_PURELINEN` / `IS_LINENTHINGS` flags for differences
5. **Clean Separation** - Environment variables control site identity

## Site-Specific Differences

Currently handled via conditional rendering:

- **Logo**: Uses `getSiteConfig().logo`
- **Cart Visibility**: `IS_LINENTHINGS || (IS_PURELINEN && isLoggedIn)`
- **Pricing Display**: `IS_LINENTHINGS || (IS_PURELINEN && customer)`
- **Homepage**: Can be made conditional using `IS_PURELINEN` / `IS_LINENTHINGS` flags

## Adding Site-Specific Features

1. Use `IS_PURELINEN` / `IS_LINENTHINGS` flags for conditional logic
2. Use `getSiteConfig()` for site-specific configuration values
3. Use `getSiteValue(purelinenValue, linenthingsValue)` helper for simple value differences

## Migration Notes

- Removed `medusa-storefront/linenthings/` folder (no longer needed)
- Removed `setup-shared-components.sh` script (no symlinks needed)
- All code now lives in `medusa-storefront/purelinen/`
- Environment variables control which site is running
