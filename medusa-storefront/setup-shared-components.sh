#!/bin/bash

# Setup shared components between purelinen and linenthings storefronts
# This creates symlinks so both sites use the same component files
# Site-specific differences are handled via site-config constants

set -e

PURELINEN_DIR="purelinen/src"
LINENTHINGS_DIR="linenthings/src"

echo "🔗 Setting up shared components..."

# Components to share (most components are shared)
SHARED_COMPONENTS=(
  "components/Header.tsx"
  "components/Logo.tsx"
  "components/CategoryMenu.tsx"
  "components/FilterButton.tsx"
  "components/MegaMenu.tsx"
  "components/HeaderDrawer.tsx"
  "components/HeaderWrapper.tsx"
  "components/SearchField.tsx"
  "components/CartDrawer.tsx"
  "components/CartIcon.tsx"
  "components/Button.tsx"
  "components/Carousel.tsx"
  "components/Dialog.tsx"
  "components/Drawer.tsx"
  "components/Footer.tsx"
  "components/Forms.tsx"
  "components/Icon.tsx"
  "components/IconCircle.tsx"
  "components/Layout.tsx"
  "components/Link.tsx"
  "components/LocalizedLink.tsx"
  "components/NewsletterForm.tsx"
  "components/NumberField.tsx"
  "components/ProductPageGallery.tsx"
  "components/RegionSwitcher.tsx"
  "components/CollectionsSection.tsx"
  "components/ui"
  "components/icons"
)

# Data functions to share
SHARED_DATA=(
  "lib/data/colors-list.ts"
  "lib/data/product-types.ts"
  "lib/data/categories.ts"
  "lib/data/customer.ts"
  "lib/data/regions.ts"
  "lib/data/products.ts"
  "lib/data/collections.ts"
  "lib/data/cart.ts"
  "lib/data/orders.ts"
  "lib/data/payment.ts"
  "lib/data/fulfillment.ts"
)

# Modules to share (most modules are shared)
SHARED_MODULES=(
  "modules/products"
  "modules/store"
  "modules/collections"
  "modules/cart"
  "modules/checkout"
  "modules/account"
  "modules/common"
  "modules/header"
  "modules/auth"
  "modules/order"
  "modules/skeletons"
)

# Hooks to share
SHARED_HOOKS=(
  "hooks/cart.ts"
  "hooks/country-code.tsx"
  "hooks/customer.ts"
  "hooks/store.tsx"
)

# Utils to share
SHARED_UTILS=(
  "lib/util/collections.ts"
  "lib/util/compare-addresses.ts"
  "lib/util/enrich-line-items.ts"
  "lib/util/env.ts"
  "lib/util/get-precentage-diff.ts"
  "lib/util/get-product-price.ts"
  "lib/util/inventory.ts"
  "lib/util/isEmpty.ts"
  "lib/util/medusa-error.ts"
  "lib/util/money.ts"
  "lib/util/react-query.tsx"
  "lib/util/repeat.ts"
  "lib/util/sort-products.ts"
)

# App pages to share (excluding home page)
SHARED_APP_PAGES=(
  "app/[countryCode]/(checkout)"
  "app/[countryCode]/(main)/account"
  "app/[countryCode]/(main)/auth"
  "app/[countryCode]/(main)/cart"
  "app/[countryCode]/(main)/collections"
  "app/[countryCode]/(main)/order"
  "app/[countryCode]/(main)/products"
  "app/[countryCode]/(main)/search"
  "app/[countryCode]/(main)/store"
  "app/[countryCode]/(main)/about"
  "app/[countryCode]/(main)/cookie-policy"
  "app/[countryCode]/(main)/inspiration"
  "app/[countryCode]/(main)/privacy-policy"
  "app/[countryCode]/(main)/terms-of-use"
  "app/[countryCode]/(main)/layout.tsx"
  "app/[countryCode]/(checkout)/layout.tsx"
  "app/layout.tsx"
  "app/not-found.tsx"
  "app/robots.ts"
)

# Other shared files
SHARED_OTHER=(
  "lib/config.ts"
  "lib/constants.tsx"
  "lib/search-client.ts"
  "middleware.ts"
  "types"
)

echo "📁 Creating symlinks for shared components..."
cd "$LINENTHINGS_DIR"

for component in "${SHARED_COMPONENTS[@]}"; do
  if [ -e "$component" ] && [ ! -L "$component" ]; then
    echo "  Removing existing: $component"
    rm -rf "$component"
  fi
  if [ ! -L "$component" ]; then
    echo "  Linking: $component"
    mkdir -p "$(dirname "$component")"
    ln -sf "../../$PURELINEN_DIR/$component" "$component"
  fi
done

echo "📊 Creating symlinks for shared data functions..."
for data in "${SHARED_DATA[@]}"; do
  if [ -e "$data" ] && [ ! -L "$data" ]; then
    echo "  Removing existing: $data"
    rm -f "$data"
  fi
  if [ ! -L "$data" ]; then
    echo "  Linking: $data"
    mkdir -p "$(dirname "$data")"
    ln -sf "../../$PURELINEN_DIR/$data" "$data"
  fi
done

echo "📦 Creating symlinks for shared modules..."
for module in "${SHARED_MODULES[@]}"; do
  if [ -d "$module" ] && [ ! -L "$module" ]; then
    echo "  Removing existing: $module"
    rm -rf "$module"
  fi
  if [ ! -L "$module" ]; then
    echo "  Linking: $module"
    mkdir -p "$(dirname "$module")"
    ln -sf "../../$PURELINEN_DIR/$module" "$module"
  fi
done

echo "🪝 Creating symlinks for shared hooks..."
for hook in "${SHARED_HOOKS[@]}"; do
  if [ -e "$hook" ] && [ ! -L "$hook" ]; then
    echo "  Removing existing: $hook"
    rm -f "$hook"
  fi
  if [ ! -L "$hook" ]; then
    echo "  Linking: $hook"
    mkdir -p "$(dirname "$hook")"
    ln -sf "../../$PURELINEN_DIR/$hook" "$hook"
  fi
done

echo "🔧 Creating symlinks for shared utils..."
for util in "${SHARED_UTILS[@]}"; do
  if [ -e "$util" ] && [ ! -L "$util" ]; then
    echo "  Removing existing: $util"
    rm -f "$util"
  fi
  if [ ! -L "$util" ]; then
    echo "  Linking: $util"
    mkdir -p "$(dirname "$util")"
    ln -sf "../../$PURELINEN_DIR/$util" "$util"
  fi
done

echo "📄 Creating symlinks for shared app pages..."
for page in "${SHARED_APP_PAGES[@]}"; do
  if [ -e "$page" ] || [ -d "$page" ]; then
    if [ ! -L "$page" ]; then
      echo "  Removing existing: $page"
      rm -rf "$page"
    fi
  fi
  if [ ! -L "$page" ]; then
    echo "  Linking: $page"
    mkdir -p "$(dirname "$page")"
    ln -sf "../../$PURELINEN_DIR/$page" "$page"
  fi
done

echo "📚 Creating symlinks for other shared files..."
for other in "${SHARED_OTHER[@]}"; do
  if [ -e "$other" ] || [ -d "$other" ]; then
    if [ ! -L "$other" ]; then
      echo "  Removing existing: $other"
      rm -rf "$other"
    fi
  fi
  if [ ! -L "$other" ]; then
    echo "  Linking: $other"
    mkdir -p "$(dirname "$other")"
    ln -sf "../../$PURELINEN_DIR/$other" "$other"
  fi
done

echo ""
echo "✅ Shared components setup complete!"
echo ""
echo "📝 Files kept separate (site-specific):"
echo "  - src/app/[countryCode]/(main)/page.tsx (home page - different content)"
echo "  - src/lib/config/site-config.ts (site config - different defaults)"
echo "  - next.config.js (may have site-specific settings)"
echo "  - package.json (different ports)"
echo ""
echo "💡 All differences are handled via IS_LINENTHINGS / IS_PURELINEN constants"
echo "📊 Total symlinks created: $(find . -type l | wc -l | tr -d ' ')"