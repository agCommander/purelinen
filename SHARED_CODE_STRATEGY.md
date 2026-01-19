# Shared Code Strategy

## Overview

Instead of copying files between `purelinen` and `linenthings` storefronts, we use **symlinks** to share code. Site-specific differences are handled via the `site-config` constants (`IS_LINENTHINGS`, `IS_PURELINEN`).

## Setup

Run the setup script to create symlinks:

```bash
cd medusa-storefront
./setup-shared-components.sh
```

## What's Shared vs Separate

### ✅ **Shared (via symlinks)**

**Components:**
- `Header.tsx` - Uses site-config for logo and cart visibility
- `Logo.tsx` - Uses site-config to show correct logo
- `CategoryMenu.tsx`, `MegaMenu.tsx`, `FilterButton.tsx`
- `HeaderDrawer.tsx` - Uses site-config for logo and cart
- Most UI components (Button, Dialog, Drawer, etc.)
- All icons

**Data Functions:**
- `lib/data/colors-list.ts`
- `lib/data/product-types.ts`
- `lib/data/categories.ts`
- `lib/data/customer.ts`
- `lib/data/regions.ts`
- `lib/data/products.ts`
- `lib/data/collections.ts`
- All other data functions

**Modules:**
- `modules/products` - Product pages, components
- `modules/store` - Store/listing pages
- `modules/collections` - Collection pages
- `modules/cart` - Cart functionality
- `modules/checkout` - Checkout flow
- `modules/account` - Account pages
- `modules/common` - Common utilities
- `modules/header` - Header-related modules

### ❌ **Separate (site-specific)**

**Pages:**
- `src/app/[countryCode]/(main)/page.tsx` - Home page (different content)

**Config:**
- `src/lib/config/site-config.ts` - Site configuration (different defaults)
- `next.config.js` - Can be shared but may have site-specific settings
- `package.json` - Different ports, but mostly the same

## How Site Differences Work

All differences are handled via constants in `site-config.ts`:

```typescript
import { IS_LINENTHINGS, IS_PURELINEN, getSiteConfig } from '@/lib/config/site-config'

// Example: Show cart based on site
const shouldShowCart = IS_LINENTHINGS || (IS_PURELINEN && isLoggedIn)

// Example: Get site-specific logo
const logo = IS_PURELINEN 
  ? '/images/content/PURELINEN-GREY-LOGO.png'
  : '/images/LT_Logo.png'

// Example: Get site config
const config = getSiteConfig()
const siteName = config.name // "Pure Linen" or "Linen Things"
```

## Benefits

1. **Single source of truth** - Changes to shared components affect both sites
2. **No duplication** - One file, used by both sites
3. **Easy maintenance** - Fix bugs once, works everywhere
4. **Site-specific behavior** - Use constants for differences

## Adding New Shared Components

1. Create the component in `purelinen/src/components/`
2. Use `IS_LINENTHINGS` / `IS_PURELINEN` for any differences
3. Run `./setup-shared-components.sh` to create symlink
4. Or manually: `ln -s ../../purelinen/src/components/NewComponent.tsx linenthings/src/components/NewComponent.tsx`

## Making Components Site-Specific

If a component needs to be different between sites:

1. Remove the symlink: `rm linenthings/src/components/Component.tsx`
2. Copy the file: `cp purelinen/src/components/Component.tsx linenthings/src/components/Component.tsx`
3. Make site-specific changes

## Current Symlinks

To see what's currently shared:

```bash
cd medusa-storefront/linenthings/src
find . -type l -ls
```

## Troubleshooting

**Symlinks not working?**
- Make sure paths are relative: `../../purelinen/src/...`
- Check that target files exist
- Verify symlink: `ls -la component.tsx`

**Build errors?**
- Some build tools don't follow symlinks well
- May need to use a different approach (monorepo, shared package)
- For now, symlinks work with Next.js dev server
