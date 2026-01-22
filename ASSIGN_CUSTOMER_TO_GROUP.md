# Assigning Customers to Groups

## Option 1: Using the Script (Recommended)

Use the script to assign customers to groups:

```bash
cd medusa-backend/purelinen
npx medusa exec ./src/scripts/assign-customer-to-group.ts <customer-email> <group-handle>
```

**Examples:**
```bash
# Assign customer to B2B group
npx medusa exec ./src/scripts/assign-customer-to-group.ts user@example.com b2b-clients

# Assign customer to Retail group
npx medusa exec ./src/scripts/assign-customer-to-group.ts user@example.com retail-customers
```

## Option 2: Using the API Endpoint

You can also use the API endpoint directly:

```bash
# Get customer ID first (from admin panel)
# Then assign groups:
curl -X PUT http://localhost:9000/admin/customers/{customer-id}/groups \
  -H "Content-Type: application/json" \
  -d '{"group_ids": ["group-id-1", "group-id-2"]}'
```

## Option 3: Via Admin UI (Future Enhancement)

Currently, the Medusa admin UI doesn't have a built-in field for customer groups. 

**Workaround:**
1. Note the customer's email from the admin panel
2. Use the script (Option 1) to assign them to a group
3. Or use the API endpoint (Option 2)

## Finding Group IDs

To find customer group IDs:

```bash
curl http://localhost:9000/admin/customer-groups
```

This will return all groups with their IDs.
