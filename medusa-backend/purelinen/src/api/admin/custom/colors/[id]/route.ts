import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

const updateColorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  hex_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Hex code must be in format #RRGGBB").optional(),
  filter_group: z.string().optional().nullable(),
});

/**
 * GET /admin/custom/colors/[id]
 * Returns a single color by ID
 */
export async function GET(
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
        `SELECT 
          id,
          name,
          hex_code,
          filter_group,
          created_at,
          updated_at,
          deleted_at
        FROM color
        WHERE id = $1`,
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
    console.error("Error fetching color:", error);
    res.status(500).json({ 
      error: "Failed to fetch color",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * PUT /admin/custom/colors/[id]
 * Updates a color
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.params;
    const body = updateColorSchema.parse(req.body);
    
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
      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (body.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(body.name);
      }
      
      if (body.hex_code !== undefined) {
        updates.push(`hex_code = $${paramIndex++}`);
        values.push(body.hex_code);
      }
      
      if (body.filter_group !== undefined) {
        updates.push(`filter_group = $${paramIndex++}`);
        values.push(body.filter_group || null);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE color 
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, hex_code, filter_group, created_at, updated_at, deleted_at`,
        values
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation error",
        details: error.errors
      });
    }
    
    console.error("Error updating color:", error);
    res.status(500).json({ 
      error: "Failed to update color",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * DELETE /admin/custom/colors/[id]
 * Soft deletes a color (sets deleted_at)
 */
export async function DELETE(
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
         SET deleted_at = NOW(), updated_at = NOW()
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
    console.error("Error deleting color:", error);
    res.status(500).json({ 
      error: "Failed to delete color",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

