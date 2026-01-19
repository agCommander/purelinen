"use client"

import * as React from "react"
import { LocalizedLink } from "@/components/LocalizedLink"
import { getSiteConfig, IS_PURELINEN } from "@/lib/config/site-config"

export const Logo: React.FC = () => {
  const [isSticky, setIsSticky] = React.useState(false)
  const [isLight, setIsLight] = React.useState(false)
  const siteConfig = getSiteConfig()

  React.useEffect(() => {
    const headerElement = document.querySelector("#site-header")
    if (!headerElement) return

    // Initial state
    const updateLogo = () => {
      const sticky = headerElement.getAttribute("data-sticky") === "true"
      const light = headerElement.getAttribute("data-light") === "true"
      setIsSticky(sticky)
      setIsLight(light)
    }

    // Watch for attribute changes
    const observer = new MutationObserver(updateLogo)
    observer.observe(headerElement, {
      attributes: true,
      attributeFilter: ["data-sticky", "data-light"],
    })

    // Initial check
    updateLogo()

    return () => {
      observer.disconnect()
    }
  }, [])

  // Use site-specific logo
  const logoSrc = IS_PURELINEN 
    ? "/images/content/PURELINEN-GREY-LOGO.png"
    : "/images/content/LT_Logo.png"

  return (
    <h1 className="font-medium text-md">
      <LocalizedLink href="/">
        <img
          src={logoSrc}
          alt={siteConfig.logoAlt}
          width={220}
          className="transition-opacity duration-200"
        />
      </LocalizedLink>
    </h1>
  )
}

