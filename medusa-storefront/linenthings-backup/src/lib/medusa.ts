import Medusa from "@medusajs/medusa-js"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  maxRetries: 3,
  publishableApiKey: "pk_ba924a4f8a312781ec72edf61dd376cd66aa563d29543a60dd008b138ac679fa"
}) 