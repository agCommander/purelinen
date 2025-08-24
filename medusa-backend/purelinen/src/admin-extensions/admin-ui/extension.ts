import { AdminExtension } from "@medusajs/admin"

export const config: AdminExtension = {
  name: "enhanced-admin",
  routes: [
    {
      path: "/enhanced",
      element: "EnhancedAdminApp"
    }
  ]
}

export default config 