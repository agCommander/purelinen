export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Linen Things
            <span className="block text-green-600">Home Essentials</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Affordable luxury for your home. Quality linen products that make everyday life more beautiful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Shop Now
            </button>
            <button className="border border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              View Collections
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 