import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    cookieOptions: {
      secure: false, // Temporarily set to false to test - browser is rejecting secure cookies
      sameSite: "lax", // Important: use 'lax' for same-domain requests
      httpOnly: true,
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  plugins: [
    // MeiliSearch plugin disabled for development - uncomment when needed
    // {
    //   resolve: "@rokmohar/medusa-plugin-meilisearch",
    //   options: {
    //     config: {
    //       host: process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700",
    //       apiKey: process.env.MEILISEARCH_API_KEY || "ms",
    //     },
    //     settings: {
    //       products: {
    //         type: "products",
    //         enabled: true,
    //         fields: [
    //           "id",
    //           "title",
    //           "description",
    //           "handle",
    //           "status",
    //           "created_at",
    //           "updated_at",
    //           "published_at",
    //           "thumbnail",
    //           "collection_id",
    //           "type_id",
    //           "tags",
    //           "options",
    //           "variants",
    //           "categories",
    //         ],
    //         indexSettings: {
    //           searchableAttributes: [
    //             "title",
    //             "description",
    //             "handle",
    //             "tags",
    //             "variants.title",
    //             "variants.sku",
    //           ],
    //           displayedAttributes: [
    //             "id",
    //             "title",
    //             "description",
    //             "handle",
    //             "status",
    //             "thumbnail",
    //             "collection_id",
    //             "type_id",
    //             "tags",
    //             "variants",
    //             "categories",
    //           ],
    //           filterableAttributes: [
    //             "id",
    //             "handle",
    //             "status",
    //             "collection_id",
    //             "type_id",
    //             "tags",
    //             "variants.inventory_quantity",
    //             "variants.manage_inventory",
    //             "categories.id",
    //             "categories.handle",
    //           ],
    //           sortableAttributes: [
    //             "created_at",
    //             "updated_at",
    //             "published_at",
    //             "variants.calculated_price",
    //           ],
    //         },
    //         primaryKey: "id",
    //       },
    //     },
    //   },
    // },
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
  ],
})
