# Shared Storefront Setup Guide

## Overview

This guide explains how to share code between the Pure Linen and Linen Things storefronts, with site-specific branding controlled by environment variables (similar to htaccess in Magento).

## Site Identification

The system uses an environment variable `NEXT_PUBLIC_STORE_NAME` to identify which website is running:

- `purelinen` - Pure Linen website
- `linenthings` - Linen Things website

## Setup

### 1. Environment Variables

Create `.env.local` files in each storefront directory:

**medusa-storefront/purelinen/.env.local:**
```env
NEXT_PUBLIC_STORE_NAME=purelinen
```

**medusa-storefront/linenthings/.env.local:**
```env
NEXT_PUBLIC_STORE_NAME=linenthings
```

### 2. Using Site Config in Code

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

// Get site config
const config = getSiteConfig()
const logo = config.logo // '/images/PL_logo.png' or '/images/LT_Logo.png'

// Get site-specific values
const logo = getSiteValue('/images/PL_logo.png', '/images/LT_Logo.png')
```

### 3. Examples

#### Logo Component (Already Updated)
```typescript
import { getSiteConfig, IS_PURELINEN } from '@/lib/config/site-config'

const siteConfig = getSiteConfig()
const logoSrc = IS_PURELINEN 
  ? "/images/content/PURELINEN-GREY-LOGO.png"
  : "/images/LT_Logo.png"
```

#### Header Component
```typescript
import { getSiteConfig } from '@/lib/config/site-config'

const siteConfig = getSiteConfig()
// Use siteConfig.name, siteConfig.colorScheme, etc.
```

#### Conditional Rendering
```typescript
import { IS_PURELINEN } from '@/lib/config/site-config'

{IS_PURELINEN ? (
  <PureLinenComponent />
) : (
  <LinenThingsComponent />
)}
```

## What to Share vs. Keep Separate

### ✅ Share (Same Code)
- Product pages (`/products/[handle]`)
- Category pages (`/categories/[handle]`)
- Collection pages (`/collections/[handle]`)
- Cart, Checkout, Account pages
- All static pages (About, Shipping, etc.)
- Components (except Header and Logo)
- Data fetching logic
- Styles (with site-specific overrides)

### ❌ Keep Separate
- **Home page** (`src/app/[countryCode]/(main)/page.tsx`)
- **Header component** (`src/components/Header.tsx`) - Can share but customize
- **Logo component** (`src/components/Logo.tsx`) - Already uses site config
- Site-specific images/logos
- Site-specific metadata

## Code Sharing Strategy

### Option 1: Symlinks (Simple)
Create symlinks for shared directories:

```bash
# From linenthings directory
ln -s ../purelinen/src/modules ./src/modules-shared
ln -s ../purelinen/src/lib/data ./src/lib/data-shared
```

### Option 2: Shared Package (Recommended)
Create a shared package in `medusa-storefront/shared/`:

```
medusa-storefront/
├── shared/
│   ├── components/
│   ├── lib/
│   └── modules/
├── purelinen/
│   └── src/
│       ├── app/
│       │   └── [countryCode]/(main)/
│       │       └── page.tsx (unique home page)
│       └── components/
│           └── Header.tsx (customized)
└── linenthings/
    └── src/
        ├── app/
        │   └── [countryCode]/(main)/
        │       └── page.tsx (unique home page)
        └── components/
            └── Header.tsx (customized)
```

### Option 3: Monorepo with Workspaces
Use npm/yarn workspaces to share code as a package.

## Site-Specific Configuration

Add more site-specific values to `src/lib/config/site-config.ts`:

```typescript
export const SITE_CONFIG = {
  purelinen: {
    name: 'Pure Linen',
    logo: '/images/PL_logo.png',
    logoAlt: 'Pure Linen Logo',
    domain: 'purelinen.com.au',
    colorScheme: 'blue',
    primaryColor: '#1e40af',
    // Add more config here
  },
  linenthings: {
    name: 'Linen Things',
    logo: '/images/LT_Logo.png',
    logoAlt: 'Linen Things Logo',
    domain: 'linenthings.com.au',
    colorScheme: 'green',
    primaryColor: '#059669',
    // Add more config here
  },
}
```

## Production Deployment

In production, set the environment variable:

**Vercel/Netlify:**
- Set `NEXT_PUBLIC_STORE_NAME` in environment variables

**Docker:**
```dockerfile
ENV NEXT_PUBLIC_STORE_NAME=purelinen
```

**Server:**
```bash
export NEXT_PUBLIC_STORE_NAME=purelinen
```

The system will also auto-detect from hostname if the env var is not set.

## Migration Steps

1. ✅ Site config system created
2. ✅ Logo component updated to use site config
3. ⏳ Update Header component to use site config
4. ⏳ Create shared code structure
5. ⏳ Move shared components/modules
6. ⏳ Keep home pages separate
7. ⏳ Test both sites
