export interface ImageSize {
  name: string
  width: number
  height: number
  description: string
  usage: string[]
}

export interface SwatchData {
  id: string
  name: string
  color_code: string
  color_name: string
  image_url: string
  thumbnail_url: string
  category: string
  created_at: Date
  updated_at: Date
  usage_count: number
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  thumbnail_url: string
  alt_text: string
  position: number
  is_primary: boolean
  swatch_id?: string
  variant_id?: string
  created_at: Date
}

export class ImageStandards {
  // Standard image sizes for Pure Linen
  static readonly IMAGE_SIZES: ImageSize[] = [
    {
      name: "thumbnail",
      width: 200,
      height: 300,
      description: "Small thumbnail for product grids",
      usage: ["product_grid", "cart", "wishlist"]
    },
    {
      name: "medium",
      width: 400,
      height: 600,
      description: "Medium size for product listings",
      usage: ["product_list", "category_pages"]
    },
    {
      name: "large",
      width: 800,
      height: 1200,
      description: "Large size for product detail pages",
      usage: ["product_detail", "zoom_view"]
    },
    {
      name: "extra_large",
      width: 1000,
      height: 1500,
      description: "Extra large for high-resolution displays",
      usage: ["product_detail", "full_screen", "print"]
    }
  ]

  // Get image size by name
  static getImageSize(name: string): ImageSize | undefined {
    return this.IMAGE_SIZES.find(size => size.name === name)
  }

  // Get all image sizes
  static getAllImageSizes(): ImageSize[] {
    return this.IMAGE_SIZES
  }

  // Validate image dimensions
  static validateImageDimensions(width: number, height: number): boolean {
    return this.IMAGE_SIZES.some(size => 
      (width === size.width && height === size.height) ||
      (width === size.height && height === size.width) // Allow rotation
    )
  }

  // Get recommended size for usage
  static getRecommendedSize(usage: string): ImageSize | undefined {
    const sizes = this.IMAGE_SIZES.filter(size => size.usage.includes(usage))
    return sizes.length > 0 ? sizes[0] : this.IMAGE_SIZES[2] // Default to large
  }
} 