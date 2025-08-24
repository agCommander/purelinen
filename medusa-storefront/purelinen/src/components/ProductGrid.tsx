import Image from "next/image"
import Link from "next/link"

interface Product {
  id?: string
  title?: string
  handle?: string
  thumbnail?: string
  variants?: Array<{
    id?: string
    prices?: Array<{
      amount?: number
      currency_code?: string
    }>
  }>
  metadata?: {
    product_type?: {
      type?: string
    }
    shared_stock?: number
    store_stocks?: {
      [key: string]: {
        enabled?: boolean
      }
    }
  }
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const formatPrice = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const getProductType = (product: Product) => {
    return product.metadata?.product_type?.type || "simple"
  }

  const getStockStatus = (product: Product) => {
    const sharedStock = product.metadata?.shared_stock || 0
    if (sharedStock === 0) return { status: "out", text: "Out of Stock", color: "text-red-600" }
    if (sharedStock <= 10) return { status: "low", text: "Low Stock", color: "text-orange-600" }
    return { status: "in", text: "In Stock", color: "text-green-600" }
  }

  const isEnabledForStore = (product: Product, storeId: string) => {
    return product.metadata?.store_stocks?.[storeId]?.enabled !== false
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const price = product.variants?.[0]?.prices?.[0]?.amount || 0
        const stockStatus = getStockStatus(product)
        const productType = getProductType(product)
        const isEnabled = isEnabledForStore(product, "purelinen")

        if (!isEnabled || !product.id || !product.title) return null

        return (
          <div key={product.id} className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/products/${product.handle || product.id}`}>
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                
                {/* Product Type Badge */}
                {productType !== "simple" && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {productType.charAt(0).toUpperCase() + productType.slice(1)}
                  </div>
                )}
                
                {/* Stock Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-white ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                  
                  {/* Shared Stock Indicator */}
                  <span className="text-sm text-gray-500">
                    Shared Stock
                  </span>
                </div>
                
                {/* Swatch Preview (if configurable) */}
                {productType === "configurable" && (
                  <div className="mt-3 flex space-x-2">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-gray-300"></div>
                    <span className="text-xs text-gray-500 ml-2">+3 more</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
} 