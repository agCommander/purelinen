
      import { ProductCategoryService } from "@medusajs/medusa"
      import { ModuleExports } from "@medusajs/modules-sdk"
      
      const categories = [
  {
    "id": "4",
    "name": "Bathroom",
    "handle": "bathroom",
    "description": "",
    "parent_category_id": "2",
    "is_active": true
  },
  {
    "id": "5",
    "name": "Children's Bathroom Linens",
    "handle": "childrens-bathroom-linens",
    "description": "",
    "parent_category_id": "4",
    "is_active": true
  },
  {
    "id": "6",
    "name": "Laundry Bags",
    "handle": "laundry-bags",
    "description": "",
    "parent_category_id": "4",
    "is_active": true
  },
  {
    "id": "7",
    "name": "Terry Bath Towels & Accessories",
    "handle": "terry-bath-towels-accessories",
    "description": "",
    "parent_category_id": "4",
    "is_active": true
  },
  {
    "id": "8",
    "name": "Bath Towels and Accessories",
    "handle": "bath-towels-and-accessories",
    "description": "",
    "parent_category_id": "4",
    "is_active": true
  },
  {
    "id": "9",
    "name": "Bedroom",
    "handle": "bedroom",
    "description": "",
    "parent_category_id": "2",
    "is_active": true
  },
  {
    "id": "10",
    "name": "Pure Linen Bed Linen",
    "handle": "pure-linen-bed-linen",
    "description": "",
    "parent_category_id": "9",
    "is_active": true
  },
  {
    "id": "11",
    "name": "Children's Bed Linen",
    "handle": "childrens-bed-linen",
    "description": "",
    "parent_category_id": "9",
    "is_active": true
  },
  {
    "id": "12",
    "name": "Home Decor",
    "handle": "home-decor",
    "description": "",
    "parent_category_id": "2",
    "is_active": true
  },
  {
    "id": "13",
    "name": "Linen Curtains",
    "handle": "linen-curtains",
    "description": "",
    "parent_category_id": "12",
    "is_active": true
  },
  {
    "id": "14",
    "name": "Linen Cushion Covers",
    "handle": "linen-cushion-covers",
    "description": "",
    "parent_category_id": "12",
    "is_active": true
  },
  {
    "id": "15",
    "name": "Throws and Bed Runners",
    "handle": "throws-and-bed-runners",
    "description": "",
    "parent_category_id": "12",
    "is_active": true
  },
  {
    "id": "16",
    "name": "Kitchen ",
    "handle": "kitchen",
    "description": "",
    "parent_category_id": "2",
    "is_active": true
  },
  {
    "id": "17",
    "name": "Linen Aprons",
    "handle": "linen-aprons",
    "description": "",
    "parent_category_id": "16",
    "is_active": true
  },
  {
    "id": "18",
    "name": "Linen Tea Towels",
    "handle": "linen-tea-towels",
    "description": "",
    "parent_category_id": "16",
    "is_active": true
  },
  {
    "id": "19",
    "name": "Table ",
    "handle": "table",
    "description": "",
    "parent_category_id": "2",
    "is_active": true
  },
  {
    "id": "20",
    "name": "Fabrics",
    "handle": "fabrics",
    "description": "",
    "parent_category_id": "2",
    "is_active": true
  }
];
        
      const service = new ProductCategoryService()

      export default async function seedCategories() {
        console.log("📂 Starting category import...")
        
        for (const category of categories) {
          try {
            await service.create({
              name: category.name,
              handle: category.handle,
              description: category.description || "",
              parent_category_id: category.parent_category_id === "0" ? null : category.parent_category_id,
              is_active: category.is_active
            })
            console.log(`✅ Created category: ${category.name}`)
          } catch (error) {
            if (error.message.includes("already exists")) {
              console.log(`⚠️  Category already exists: ${category.name}`)
            } else {
              console.error(`❌ Failed to create category ${category.name}:`, error.message)
            }
          }
        }
        
        console.log("🎉 Category import completed!")
      }
    