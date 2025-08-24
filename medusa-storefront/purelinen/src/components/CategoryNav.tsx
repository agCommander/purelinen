export default function CategoryNav() {
  const categories = [
    { name: "Duvet Covers", href: "/category/duvet-covers" },
    { name: "Sheet Sets", href: "/category/sheet-sets" },
    { name: "Pillowcases", href: "/category/pillowcases" },
    { name: "Towels", href: "/category/towels" },
    { name: "Table Linen", href: "/category/table-linen" },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-8 py-4">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.href}
              className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
} 