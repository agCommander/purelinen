import { LocalizedLink } from "@/components/LocalizedLink"
import { HttpTypes } from "@medusajs/types"

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <nav className={`flex items-center gap-2 text-sm text-grayscale-500 ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <span key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <LocalizedLink
                href={item.href}
                className="hover:text-grayscale-900 transition-colors"
              >
                {item.label}
              </LocalizedLink>
            ) : (
              <span className={isLast ? "text-grayscale-900" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-grayscale-400">/</span>}
          </span>
        )
      })}
    </nav>
  )
}

