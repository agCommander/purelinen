"use server"

/**
 * Server-side function to fetch color filter groups from database
 * Returns groups with their representative colors for the filter panel
 */
export async function getColorFilterGroups(): Promise<
  Array<{
    groupName: string
    hexCode: string
    colorCount: number
  }>
> {
  const groups: Array<{
    groupName: string
    hexCode: string
    colorCount: number
  }> = []

  let client: any = null
  try {
    const { Client } = require("pg")
    const connectionString = process.env.DATABASE_URL

    if (connectionString) {
      client = new Client({
        connectionString: connectionString,
        connectionTimeoutMillis: 5000,
        query_timeout: 5000,
      })

      await client.connect()

      // Get distinct filter groups with their first color's hex code as representative
      const result = await client.query(
        `
        SELECT DISTINCT
          c.filter_group as group_name,
          (
            SELECT c2.hex_code
            FROM color c2
            WHERE c2.filter_group = c.filter_group
              AND c2.deleted_at IS NULL
              AND c2.hex_code IS NOT NULL
              AND c2.hex_code != ''
            ORDER BY c2.created_at ASC
            LIMIT 1
          ) as hex_code,
          COUNT(*) as color_count
        FROM color c
        WHERE c.deleted_at IS NULL
          AND c.filter_group IS NOT NULL
          AND c.filter_group != ''
        GROUP BY c.filter_group
        ORDER BY c.filter_group ASC
      `
      ).catch(() => null)

      if (result && result.rows) {
        result.rows.forEach((row: any) => {
          if (row.group_name && row.hex_code) {
            groups.push({
              groupName: row.group_name,
              hexCode: row.hex_code,
              colorCount: parseInt(row.color_count, 10) || 0,
            })
          }
        })
      }
    }
  } catch (error) {
    console.error("Could not fetch color filter groups from database:", error)
  } finally {
    if (client) {
      try {
        await client.end()
      } catch (e) {
        // Ignore
      }
    }
  }

  return groups
}
