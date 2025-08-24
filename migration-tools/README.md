# Magento to Medusa Data Migration Tools

This directory contains tools to migrate your data from Magento to Medusa.

## 🚀 Quick Start

### 1. Export from phpMyAdmin

Follow the detailed guide in `PHPMyAdmin-Export-Guide.md` to export your Magento data:

1. **Access phpMyAdmin** via your cPanel
2. **Export required tables** as CSV files
3. **Save files** in the `magento-csv-files` folder

### 2. Convert to Medusa Format

Run the conversion script to transform your CSV data:

```bash
node import-from-csv.js
```

This will create Medusa-ready files in the `medusa-ready/` folder:
- `medusa-products.json` - Products in Medusa format
- `medusa-categories.json` - Categories in Medusa format

### 3. Review and Import

Check the generated JSON files and import them into your Medusa backend.

## 📊 What Gets Exported

### Products
- Product ID, SKU, Name
- Description and Short Description
- Price, Weight
- Status, Visibility
- Stock status and quantity
- Created/Updated dates

### Categories
- Category ID, Parent ID
- Category path and level
- Name and Description
- Position

### Product-Category Relationships
- Which products belong to which categories
- Position within categories

## 🔧 Customization

You can modify the export queries in `export-products.js` to:
- Add more product attributes
- Filter specific products
- Include additional data

## 📁 File Structure

```
migration-tools/
├── .env.example          # Database configuration template
├── .env                  # Your actual database config (create this)
├── export-products.js    # Main export script
├── exports/              # Generated CSV files
│   ├── products.csv
│   ├── categories.csv
│   └── product_categories.csv
└── README.md            # This file
```

## ⚠️ Important Notes

1. **Backup First**: Always backup your Magento database before running exports
2. **Test Connection**: Make sure you can connect to your Magento database
3. **Review Data**: Check the exported CSV files before importing to Medusa
4. **Re-run Capable**: You can run this export multiple times during development

## 🎯 Next Steps

After exporting:
1. Review the CSV files
2. Import data into Medusa (we'll create this script next)
3. Test with your storefronts
4. Repeat as needed during development

## 🆘 Troubleshooting

### Connection Issues
- Verify database credentials in `.env`
- Check if Magento database is accessible
- Ensure MySQL server is running

### Missing Data
- Check if your Magento uses custom attribute sets
- Verify table names match your Magento version
- Review the SQL queries in the export script

### Large Datasets
- The script handles 3000+ products efficiently
- Consider running during low-traffic periods
- Monitor memory usage for very large exports 