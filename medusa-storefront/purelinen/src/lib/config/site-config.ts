/**
 * Site Configuration
 * Determines which website/brand is running
 * Set via environment variable NEXT_PUBLIC_STORE_NAME or automatically detected from hostname
 * 
 * Similar to htaccess in Magento - determines site identity
 */

export type SiteName = 'purelinen' | 'linenthings'

/**
 * Get the current site name from environment variable or hostname
 */
function getSiteName(): SiteName {
  // Check NEXT_PUBLIC_ prefixed env var (available on both server and client)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_STORE_NAME) {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME.toLowerCase()
    if (storeName === 'purelinen' || storeName === 'linenthings') {
      return storeName as SiteName
    }
  }

  // Fallback: detect from hostname (for production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase()
    if (hostname.includes('purelinen')) {
      return 'purelinen'
    }
    if (hostname.includes('linenthings')) {
      return 'linenthings'
    }
  }

  // Default fallback based on which storefront directory we're in
  // This will be set via next.config.js env variable
  return 'purelinen'
}

export const SITE_NAME = getSiteName()
export const IS_PURELINEN = SITE_NAME === 'purelinen'
export const IS_LINENTHINGS = SITE_NAME === 'linenthings'

/**
 * Site-specific configuration
 */
export const SITE_CONFIG = {
  purelinen: {
    name: 'Pure Linen',
    logo: '/images/PL_logo.png',
    logoAlt: 'Pure Linen Logo',
    domain: 'purelinen.com.au',
    colorScheme: 'blue',
    // Add other purelinen-specific config here
  },
  linenthings: {
    name: 'Linen Things',
    logo: '/images/LT_Logo.png',
    logoAlt: 'Linen Things Logo',
    domain: 'linenthings.com.au',
    colorScheme: 'green',
    // Add other linenthings-specific config here
  },
} as const

/**
 * Get current site configuration
 */
export function getSiteConfig() {
  return SITE_CONFIG[SITE_NAME]
}

/**
 * Helper to get site-specific values
 */
export function getSiteValue<T>(purelinenValue: T, linenthingsValue: T): T {
  return IS_PURELINEN ? purelinenValue : linenthingsValue
}
