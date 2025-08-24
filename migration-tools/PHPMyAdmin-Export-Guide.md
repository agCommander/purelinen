# phpMyAdmin Export Guide for Magento to Medusa Migration

## 🚀 **Step-by-Step Export Process**

### **1. Access phpMyAdmin**
- Log into your cPanel: `https://149.28.188.123:2083` or your domain with `/cpanel`
- Find and click on **"phpMyAdmin"** or **"MySQL Databases"**
- Login with your database credentials if prompted

### **2. Select Your Database**
- In the left sidebar, find and click on `newpurel_migrated`
- This will show all the tables in your Magento database

### **3. Export Required Tables**

You need to export these specific tables as CSV files:

#### **Core Tables (Required)**
- `catalog_product_entity` - Main product information
- `catalog_category_entity` - Category structure
- `catalog_category_product` - Product-category relationships

#### **Product Attribute Tables (Required)**
- `catalog_product_entity_varchar` - Product names, SKUs, etc.
- `catalog_product_entity_text` - Product descriptions
- `catalog_product_entity_decimal` - Prices, weights
- `catalog_product_entity_int` - Status, visibility

#### **Category Attribute Tables (Required)**
- `catalog_category_entity_varchar` - Category names
- `catalog_category_entity_text` - Category descriptions

#### **Inventory Table (Optional)**
- `cataloginventory_stock_item` - Stock levels

### **4. Export Each Table**

For each table:

1. **Click on the table name** in the left sidebar
2. **Click the "Export" tab** at the top
3. **Choose export method**: Select **"Custom"**
4. **Format**: Choose **"CSV"**
5. **Options**:
   - ✅ **"Put fields names in the first row"**
   - ✅ **"Fields terminated by"**: `,` (comma)
   - ✅ **"Fields enclosed by"**: `"` (double quote)
   - ✅ **"Fields escaped by"**: `\` (backslash)
   - ✅ **"Lines terminated by"**: `\n` (newline)
6. **Click "Go"** to download the CSV file

### **5. Save Files with Correct Names**

Save each CSV file with the exact table name:
- `catalog_product_entity.csv`
- `catalog_category_entity.csv`
- `catalog_category_product.csv`
- `catalog_product_entity_varchar.csv`
- `catalog_product_entity_text.csv`
- `catalog_product_entity_decimal.csv`
- `catalog_product_entity_int.csv`
- `catalog_category_entity_varchar.csv`
- `catalog_category_entity_text.csv`
- `cataloginventory_stock_item.csv`

### **6. Upload to Your Local Machine**

1. **Create the folder**: `magento-csv-files` in your migration-tools directory
2. **Upload all CSV files** to this folder
3. **Verify file names** match exactly

## 📋 **Export Checklist**

- [ ] `catalog_product_entity.csv`
- [ ] `catalog_category_entity.csv`
- [ ] `catalog_category_product.csv`
- [ ] `catalog_product_entity_varchar.csv`
- [ ] `catalog_product_entity_text.csv`
- [ ] `catalog_product_entity_decimal.csv`
- [ ] `catalog_product_entity_int.csv`
- [ ] `catalog_category_entity_varchar.csv`
- [ ] `catalog_category_entity_text.csv`
- [ ] `cataloginventory_stock_item.csv` (optional)

## 🎯 **After Export**

Once you have all CSV files in the `magento-csv-files` folder:

1. **Run the conversion script**:
   ```bash
   node import-from-csv.js
   ```

2. **Check the output**: Look in the `medusa-ready` folder for:
   - `medusa-products.json`
   - `medusa-categories.json`

3. **Review the data**: Open the JSON files to verify the conversion worked correctly

## ⚠️ **Important Notes**

- **File names must match exactly** (case-sensitive)
- **CSV format must be standard** (comma-separated, quoted fields)
- **Large files**: If you have 3000+ products, some files might be large
- **Backup**: Always backup your Magento database before any operations

## 🆘 **Troubleshooting**

### **Missing Tables**
If you can't find some tables, they might have different names in your Magento version. Check for:
- Tables starting with `catalog_`
- Tables containing `product` or `category`

### **Large Files**
If files are too large to download:
- Export in smaller batches
- Use different export methods (SQL instead of CSV)
- Contact your hosting provider for assistance

### **Permission Issues**
If you can't access phpMyAdmin:
- Check your cPanel login credentials
- Contact your hosting provider
- Try accessing via your domain instead of IP

---

**Ready to start exporting?** Follow these steps and let me know when you have the CSV files ready! 🚀 