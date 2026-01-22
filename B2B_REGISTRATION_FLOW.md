# B2B Registration Flow

## Overview

Pure Linen uses a **2-step registration process** for B2B wholesale customers:

1. **Step 1**: Basic account creation (email, name, password)
2. **Step 2**: Business information (ABN/ACN, business description)

After completing both steps, accounts require **admin approval** before customers can log in.

## Registration Flow

### Step 1: Account Creation
- User fills out basic registration form
- Account is created with `approved: false` and `registration_step: 1`
- Customer is automatically assigned to `b2b-clients` group
- User is NOT logged in automatically
- Step 2 form is shown immediately

### Step 2: Business Information
- User provides:
  - **ABN or ACN** (9-11 digits, Australian Business/Company Number)
  - **Business Description** (why they need wholesale account)
- Data is stored in customer `metadata`
- `registration_step` is set to `2`
- `approved` remains `false`
- User sees "pending approval" message

### Approval Process
- Admin reviews customer's business information
- Admin approves/rejects via:
  - API: `PUT /admin/customers/[id]/approve` with `{ approved: true/false }`
  - Or admin UI (to be implemented)
- When approved, `approved` is set to `true`
- Customer can now log in

## Login Protection

Login is blocked if:
1. `registration_step` is not `2` (step 2 incomplete)
2. `approved` is `false` or `null`

Error messages:
- "Please complete your business information registration to continue."
- "Your account is pending approval. You will be notified via email once your account has been approved."

## API Endpoints

### Store Endpoints (Customer-facing)
- `POST /store/custom/customer/b2b-signup` - Assign customer to B2B group
- `POST /store/custom/customer/complete-b2b-registration` - Complete step 2

### Admin Endpoints
- `PUT /admin/customers/[id]/approve` - Approve/reject customer
  ```json
  {
    "approved": true
  }
  ```

## Customer Metadata Fields

B2B customers have these metadata fields:
- `approved`: boolean (false by default)
- `registration_step`: number (1 = step 1 done, 2 = both steps done)
- `abn_acn`: string (Australian Business/Company Number)
- `business_description`: string (why they need wholesale account)
- `approved_at`: ISO date string (when approved, if approved)

## Retail Customers (Linen Things)

- No 2-step process
- No approval required
- No customer group assignment (or assigned to `retail-customers`)
- Can log in immediately after registration

## Testing the Flow

1. **Register on Pure Linen:**
   - Go to `/auth/register`
   - Fill out step 1 form
   - Complete step 2 form (ABN/ACN + description)

2. **Try to Login:**
   - Should see "pending approval" message

3. **Approve Customer (Admin):**
   ```bash
   curl -X PUT http://localhost:9000/admin/customers/{customer-id}/approve \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {admin-token}" \
     -d '{"approved": true}'
   ```

4. **Login Again:**
   - Should work now!

## Admin Approval UI (Future)

To approve customers in the admin:
1. Go to Customers
2. View customer details
3. See ABN/ACN and business description
4. Click "Approve" or "Reject" button
