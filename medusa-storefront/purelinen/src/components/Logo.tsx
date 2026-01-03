"use client"

import * as React from "react"
import { LocalizedLink } from "@/components/LocalizedLink"

export const Logo: React.FC = () => {
  const [isSticky, setIsSticky] = React.useState(false)
  const [isLight, setIsLight] = React.useState(false)

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

  // Always use grey logo
  const logoSrc = "/images/content/PURELINEN-GREY-LOGO.png"

  return (
    <h1 className="font-medium text-md">
      <LocalizedLink href="/">
        <img
          src={logoSrc}
          alt="Pure Linen"
          width={220}
          className="transition-opacity duration-200"
        />
      </LocalizedLink>
    </h1>
  )
}

