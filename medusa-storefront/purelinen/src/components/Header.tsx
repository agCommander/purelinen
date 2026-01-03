import * as React from "react"
import { listRegions } from "@lib/data/regions"
import { getProductTypesList } from "@lib/data/product-types"
import { getCategoriesList } from "@lib/data/categories"
import { getCustomer } from "@lib/data/customer"
import { SearchField } from "@/components/SearchField"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { HeaderDrawer } from "@/components/HeaderDrawer"
import { RegionSwitcher } from "@/components/RegionSwitcher"
import { HeaderWrapper } from "@/components/HeaderWrapper"
import { Logo } from "@/components/Logo"
import { CategoryMenu } from "@/components/CategoryMenu"

import dynamic from "next/dynamic"

const LoginLink = dynamic(
  () => import("@modules/header/components/LoginLink"),
  { loading: () => <></> }
)

const CartDrawer = dynamic(
  () => import("@/components/CartDrawer").then((mod) => mod.CartDrawer),
  { loading: () => <></> }
)

export const Header: React.FC = async () => {
  const regions = await listRegions()
  const [productTypes, categories, customer] = await Promise.all([
    getProductTypesList(0, 100, ["id", "value", "metadata"]),
    getCategoriesList(0, 100, ["id", "name", "handle", "metadata"]),
    getCustomer().catch(() => null),
  ])
  
  const isLoggedIn = !!customer

  const countryOptions = regions
    .map((r) => {
      return (r.countries ?? []).map((c) => ({
        country: c.iso_2,
        region: r.id,
        label: c.display_name,
      }))
    })
    .flat()
    .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))

  // Product Types will be the main menu items
  // Order them as needed (you can customize this list)
  const typeOrder = [
    "Dining",
    "Bedroom",
    "Home Decor",
    "Bathroom",
    "Tea Towels",
    "Aprons",
    "Fabrics",
    "Accessories"
  ]
  const orderedProductTypes =
    productTypes?.productTypes
      .filter((type) => typeOrder.includes(type.value))
      .sort(
        (a, b) => typeOrder.indexOf(a.value) - typeOrder.indexOf(b.value)
      ) || []

  return (
    <>
      <HeaderWrapper>
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-12 md:h-12">
            {/* Logo and Product Types - hard left aligned */}
            <div className="flex items-center gap-8 flex-shrink-0">
              <Logo />
              {orderedProductTypes.length > 0 && (
                <div className="max-[1000px]:hidden">
                  <CategoryMenu
                    productTypes={orderedProductTypes}
                    categories={categories?.product_categories || []}
                  />
                </div>
              )}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">
              {/*<RegionSwitcher
                countryOptions={countryOptions}
                className="w-16 max-md:hidden"
                selectButtonClassName="h-auto !gap-0 !p-1 transition-none"
                selectIconClassName="text-current"
              />*/}
              <React.Suspense>
                <SearchField countryOptions={countryOptions} />
              </React.Suspense>
              <LoginLink className="p-1 group-data-[light=true]:md:text-white group-data-[sticky=true]:md:text-gray-500" />
              {isLoggedIn && <CartDrawer />}
            </div>

            {/* Mobile menu */}
            <div className="hidden max-[1000px]:flex items-center gap-4">
              <React.Suspense>
                <HeaderDrawer 
                  countryOptions={countryOptions}
                  productTypes={orderedProductTypes}
                  categories={categories?.product_categories || []}
                  isLoggedIn={isLoggedIn}
                />
              </React.Suspense>
            </div>
          </div>
        </div>
      </HeaderWrapper>
    </>
  )
}
