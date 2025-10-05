#!/bin/bash

# Generate SQL insert statements for variants temp table
# Handle CSV parsing properly with Python and generate proper Medusa IDs

python3 << 'EOF'
import csv
import sys
import uuid

def generate_medusa_id():
    """Generate a Medusa-style ID"""
    unique_id = str(uuid.uuid4()).replace('-', '')
    return unique_id[:20].upper()

def fix_excel_encoding(text):
    """Fix common Excel encoding issues"""
    if text:
        # Fix KLAIPƒñDA -> KLAIPĖDA
        text = text.replace('KLAIPƒñDA', 'KLAIPĖDA')
        return text
    return text

print("-- SQL Insert statements for Variants Temp Table")
print("-- Generated from variants.csv")
print("-- Fixed Excel encoding issues")
print("")
print("INSERT INTO product_variant_temp (")
print("    id,")
print("    title,")
print("    sku,")
print("    price_usd,")
print("    allow_backorder,")
print("    manage_inventory,")
print("    product_handle,")
print("    variant1_name,")
print("    variant1_value,")
print("    variant2_name,")
print("    variant2_value,")
print("    variant3_name,")
print("    variant3_value,")
print("    image_url")
print(") VALUES")

with open('medusa-ready/variants.csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    next(reader)  # Skip header
    
    rows = []
    for row in reader:
        if len(row) >= 11:
            product_handle = row[0].strip()
            variant_title = fix_excel_encoding(row[1].strip()).replace("'", "''")
            variant_sku = row[2].strip()
            price_usd = row[3].strip() if row[3].strip() else '0'
            variant1_name = row[4].strip() if len(row) > 4 and row[4].strip() else None
            variant1_value = row[5].strip().replace("'", "''") if len(row) > 5 and row[5].strip() else None
            variant2_name = row[6].strip() if len(row) > 6 and row[6].strip() else None
            variant2_value = row[7].strip().replace("'", "''") if len(row) > 7 and row[7].strip() else None
            variant3_name = row[8].strip() if len(row) > 8 and row[8].strip() else None
            variant3_value = row[9].strip().replace("'", "''") if len(row) > 9 and row[9].strip() else None
            image_url = row[10].strip() if len(row) > 10 and row[10].strip() else None
            
            # Generate unique ID
            variant_id = f"variant_{generate_medusa_id()}"
            
            # Handle NULL values
            variant1_name_sql = f"'{variant1_name}'" if variant1_name else "NULL"
            variant1_value_sql = f"'{variant1_value}'" if variant1_value else "NULL"
            variant2_name_sql = f"'{variant2_name}'" if variant2_name else "NULL"
            variant2_value_sql = f"'{variant2_value}'" if variant2_value else "NULL"
            variant3_name_sql = f"'{variant3_name}'" if variant3_name else "NULL"
            variant3_value_sql = f"'{variant3_value}'" if variant3_value else "NULL"
            image_url_sql = f"'{image_url}'" if image_url else "NULL"
            
            rows.append(f"('{variant_id}', '{variant_title}', '{variant_sku}', {price_usd}, false, true, '{product_handle}', {variant1_name_sql}, {variant1_value_sql}, {variant2_name_sql}, {variant2_value_sql}, {variant3_name_sql}, {variant3_value_sql}, {image_url_sql})")
    
    # Print all rows with commas, except the last one gets semicolon
    for i, row in enumerate(rows):
        if i == len(rows) - 1:
            print(f"{row};")
        else:
            print(f"{row},")

print("")
print("-- End of variant temp table insert statements")
EOF
