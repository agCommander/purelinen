import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * POST /admin/custom/colors/[id]/restore
 * Restores a soft-deleted color
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params;
    
    const { Client } = require('pg');
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      return res.status(500).json({ error: "DATABASE_URL environment variable is not set" });
    }

    const client = new Client({
      connectionString: connectionString,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    });

    await client.connect();

    try {
      const result = await client.query(
        `UPDATE color 
         SET deleted_at = NULL, updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, hex_code, filter_group, created_at, updated_at, deleted_at`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Color not found" });
      }

      res.json({
        color: result.rows[0]
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error("Error restoring color:", error);
    res.status(500).json({ 
      error: "Failed to restore color",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
