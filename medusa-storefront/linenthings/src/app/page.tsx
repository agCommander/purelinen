import { medusaClient } from "@/lib/medusa"
import ProductGrid from "@/components/ProductGrid"
import Hero from "@/components/Hero"
import CategoryNav from "@/components/CategoryNav"

export default async function Home() {
  // Fetch products from Medusa backend
  const { products } = await medusaClient.products.list({
    limit: 12,
  })

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />
      
      {/* Category Navigation */}
      <CategoryNav />
      
      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Linen Things Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Essential home textiles and linen products for everyday comfort.
          </p>
        </div>
        
        <ProductGrid products={products || []} />
      </section>
    </main>
  )
}
