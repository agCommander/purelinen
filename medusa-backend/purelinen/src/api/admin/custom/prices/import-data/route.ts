import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from 'fs';
import * as path from 'path';

/**
 * API endpoint to serve price import data for admin widget
 * Returns prices from CSV and JSON files
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Find CSV file path (go up from route.ts to workspace root)
    // route.ts is in: medusa-backend/purelinen/src/api/admin/custom/prices/import-data/
    // Need to go up 9 levels to reach workspace root
    const workspaceRoot = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', '..');
    const csvPath = path.join(workspaceRoot, 'migration-tools', 'catalog_product_index_price.csv');
    const jsonPath = path.join(workspaceRoot, 'migration-tools', 'linenthings-prices.json');
    
    // Alternative: try relative to process.cwd() if __dirname doesn't work
    const altCsvPath = path.join(process.cwd(), '..', '..', 'migration-tools', 'catalog_product_index_price.csv');
    const altJsonPath = path.join(process.cwd(), '..', '..', 'migration-tools', 'linenthings-prices.json');

    const pricesBySku: Record<string, { purelinen?: number; linenthings?: number }> = {};
    const linenthingsPricesByVariantId: Record<string, number> = {};

    // Read CSV file (try primary path, then alternative)
    const finalCsvPath = fs.existsSync(csvPath) ? csvPath : (fs.existsSync(altCsvPath) ? altCsvPath : null);
    const finalJsonPath = fs.existsSync(jsonPath) ? jsonPath : (fs.existsSync(altJsonPath) ? altJsonPath : null);
    
    if (finalCsvPath) {
      const csvContent = fs.readFileSync(finalCsvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        if (values.length >= 3) {
          const sku = values[0]?.replace(/^"|"$/g, '') || '';
          const salesChannel = values[1]?.replace(/^"|"$/g, '').toLowerCase() || '';
          const amount = parseFloat(values[2]?.replace(/^"|"$/g, '') || '0');
          
          if (sku && salesChannel && !isNaN(amount) && amount > 0) {
            if (!pricesBySku[sku]) {
              pricesBySku[sku] = {};
            }
            if (salesChannel === 'purelinen') {
              pricesBySku[sku].purelinen = amount;
            } else if (salesChannel === 'linenthings') {
              pricesBySku[sku].linenthings = amount;
            }
          }
        }
      }
    }

    // Read JSON file
    if (finalJsonPath) {
      const jsonContent = fs.readFileSync(finalJsonPath, 'utf-8');
      const linenthingsData = JSON.parse(jsonContent);
      
      linenthingsData.forEach((item: any) => {
        if (item.variant_id && item.amount) {
          linenthingsPricesByVariantId[item.variant_id] = item.amount;
        }
      });
    }

    res.json({
      pricesBySku,
      linenthingsPricesByVariantId,
      stats: {
        skusWithPurelinen: Object.values(pricesBySku).filter(p => p.purelinen).length,
        skusWithLinenthings: Object.values(pricesBySku).filter(p => p.linenthings).length,
        linenthingsVariants: Object.keys(linenthingsPricesByVariantId).length,
      }
    });
  } catch (error: any) {
    console.error("Error reading price data:", error);
    res.status(500).json({
      error: "Failed to read price data",
      message: error.message
    });
  }
}
