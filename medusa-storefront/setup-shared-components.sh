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

echo ""
echo "✅ Shared components setup complete!"
echo ""
echo "📝 Files kept separate (site-specific):"
echo "  - src/app/[countryCode]/(main)/page.tsx (home page)"
echo "  - src/lib/config/site-config.ts (site config)"
echo "  - next.config.js (can be shared but may have site-specific settings)"
echo ""
echo "💡 All differences are handled via IS_LINENTHINGS / IS_PURELINEN constants"
