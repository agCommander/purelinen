import { ProductCategoryService } from "@medusajs/medusa"

const service = new ProductCategoryService()

export default async function seed() {
  console.log("🌱 Starting seed...")

  // Create main categories
  const categories = [
    {
      name: "Bathroom",
      handle: "bathroom",
      description: "Bathroom linens and accessories"
    },
    {
      name: "Bedroom", 
      handle: "bedroom",
      description: "Bed linens and bedroom accessories"
    },
    {
      name: "Kitchen",
      handle: "kitchen", 
      description: "Kitchen linens and accessories"
    },
    {
      name: "Table",
      handle: "table",
      description: "Table linens and accessories"
    },
    {
      name: "Home Decor",
      handle: "home-decor",
      description: "Home decoration items"
    }
  ]

  for (const category of categories) {
    try {
      await service.create(category)
      console.log(`✅ Created category: ${category.name}`)
    } catch (error) {
      console.log(`⚠️  Category already exists: ${category.name}`)
    }
  }

  console.log("🎉 Seed completed!")
}
