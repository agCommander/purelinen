import * as React from "react"
import Image from "next/image"

import { getCategoriesList } from "@lib/data/categories"
import { Carousel } from "@/components/Carousel"
import { LocalizedLink } from "@/components/LocalizedLink"
import { twMerge } from "tailwind-merge"

export const CategoriesSlider: React.FC<{
  heading?: React.ReactNode
  className?: string
}> = async ({ heading = "Categories", className }) => {
  const categories = await getCategoriesList(0, 20, [
    "id",
    "name",
    "handle",
    "metadata",
  ])

  if (!categories || !categories.product_categories.length) {
    return null
  }

  return (
    <Carousel
      heading={<h3 className="text-md md:text-2xl">{heading}</h3>}
      className={twMerge("mb-26 md:mb-36", className)}
    >
      {categories.product_categories.map((c) => (
        <div
          key={c.id}
          className="w-[70%] sm:w-[60%] lg:w-full max-w-72 flex-shrink-0"
        >
          <LocalizedLink href={`/store?category=${c.handle}`}>
            {typeof c.metadata?.image === "object" &&
              c.metadata.image &&
              "url" in c.metadata.image &&
              typeof c.metadata.image.url === "string" && (
                <div className="relative mb-4 md:mb-6 w-full aspect-[3/4]">
                  <Image src={c.metadata.image.url} alt={c.name} fill />
                </div>
              )}
            <h3>{c.name}</h3>
          </LocalizedLink>
        </div>
      ))}
    </Carousel>
  )
}

