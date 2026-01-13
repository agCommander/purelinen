import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

const createColorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hex_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Hex code must be in format #RRGGBB"),
  filter_group: z.string().optional().nullable(),
});

const updateColorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  hex_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Hex code must be in format #RRGGBB").optional(),
  filter_group: z.string().optional().nullable(),
});

/**
 * GET /admin/custom/colors
 * Returns all colors (optionally filtered by deleted status)
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
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
      const includeDeleted = req.query.deleted === 'true';
      
      let query = `
        SELECT 
          id,
          name,
          hex_code,
          filter_group,
          created_at,
          updated_at,
          deleted_at
        FROM color
      `;
      
      if (!includeDeleted) {
        query += ` WHERE deleted_at IS NULL`;
      }
      
      query += ` ORDER BY name ASC`;

      const result = await client.query(query);
      
      res.json({
        colors: result.rows,
        count: result.rows.length
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ 
      error: "Failed to fetch colors",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * POST /admin/custom/colors
 * Creates a new color
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const body = createColorSchema.parse(req.body);
    
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
      // Generate ID from name (lowercase, replace spaces with hyphens)
      const id = body.name.toLowerCase().replace(/\s+/g, '-');
      
      const result = await client.query(
        `INSERT INTO color (id, name, hex_code, filter_group, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, name, hex_code, filter_group, created_at, updated_at, deleted_at`,
        [id, body.name, body.hex_code, body.filter_group || null]
      );

      res.status(201).json({
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
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ 
        error: "A color with this name already exists"
      });
    }
    
    console.error("Error creating color:", error);
    res.status(500).json({ 
      error: "Failed to create color",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
