# API Examples & Testing

## Base URL
```
http://localhost:3000/api
```

## Authentication
All requests require `x-user-id` header:
- `x-user-id: 1` - Customer (can only see their own claims)
- `x-user-id: 2` - Admin (can see all claims and update status)

---

## 1. Create Claim

**Endpoint:** `POST /api/claims`

**Headers:**
```
x-user-id: 1
Content-Type: application/json
```

**Request Body:**
```json
{
  "policyId": "POL-12345",
  "dateOfOccurrence": "2026-01-15",
  "location": "123 Main St, New York, NY",
  "cause": "Accident",
  "description": "Vehicle collision at intersection. Front bumper damaged."
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/claims \
  -H "x-user-id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "policyId": "POL-12345",
    "dateOfOccurrence": "2026-01-15",
    "location": "123 Main St, New York, NY",
    "cause": "Accident",
    "description": "Vehicle collision at intersection. Front bumper damaged."
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "policy_id": "POL-12345",
    "date_of_occurrence": "2026-01-15",
    "location": "123 Main St, New York, NY",
    "cause": "Accident",
    "description": "Vehicle collision at intersection. Front bumper damaged.",
    "status": "submitted",
    "documents": [],
    "created_at": "2026-01-19 18:20:49",
    "updated_at": "2026-01-19 18:20:49"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Policy ID is required; Location is required"
}
```

---

## 2. Create Claim with File Upload

**Endpoint:** `POST /api/claims`

**Headers:**
```
x-user-id: 1
Content-Type: multipart/form-data
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/claims \
  -H "x-user-id: 1" \
  -F "policyId=POL-67890" \
  -F "dateOfOccurrence=2026-01-10" \
  -F "location=456 Oak Ave" \
  -F "cause=Theft" \
  -F "description=Laptop stolen from vehicle" \
  -F "documents=@/path/to/photo.jpg" \
  -F "documents=@/path/to/report.pdf"
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": 1,
    "policy_id": "POL-67890",
    "date_of_occurrence": "2026-01-10",
    "location": "456 Oak Ave",
    "cause": "Theft",
    "description": "Laptop stolen from vehicle",
    "status": "submitted",
    "documents": [
      "1737312053412-123456789.jpg",
      "1737312053413-987654321.pdf"
    ],
    "created_at": "2026-01-19 18:20:53",
    "updated_at": "2026-01-19 18:20:53"
  }
}
```

---

## 3. List All Claims (Admin)

**Endpoint:** `GET /api/claims`

**Headers:**
```
x-user-id: 2
```

**cURL:**
```bash
curl http://localhost:3000/api/claims \
  -H "x-user-id: 2"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "user_id": 1,
      "policy_id": "POL-11111",
      "date_of_occurrence": "2026-01-18",
      "location": "789 Pine Rd, Chicago, IL",
      "cause": "Damage",
      "description": "Water damage to basement from burst pipe.",
      "status": "submitted",
      "documents": [],
      "created_at": "2026-01-19 18:20:57",
      "updated_at": "2026-01-19 18:20:57"
    },
    {
      "id": 2,
      "user_id": 1,
      "policy_id": "POL-67890",
      "date_of_occurrence": "2026-01-10",
      "location": "456 Oak Ave, Los Angeles, CA",
      "cause": "Theft",
      "description": "Laptop stolen from vehicle in parking lot.",
      "status": "approved",
      "documents": [],
      "created_at": "2026-01-19 18:20:53",
      "updated_at": "2026-01-19 18:21:09"
    },
    {
      "id": 1,
      "user_id": 1,
      "policy_id": "POL-12345",
      "date_of_occurrence": "2026-01-15",
      "location": "123 Main St, New York, NY",
      "cause": "Accident",
      "description": "Vehicle collision at intersection.",
      "status": "inReview",
      "documents": [],
      "created_at": "2026-01-19 18:20:49",
      "updated_at": "2026-01-19 18:21:05"
    }
  ],
  "count": 3
}
```

---

## 4. List Claims (Customer - Scoped)

**Endpoint:** `GET /api/claims`

**Headers:**
```
x-user-id: 1
```

**cURL:**
```bash
curl http://localhost:3000/api/claims \
  -H "x-user-id: 1"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    // Only claims where user_id = 1
  ],
  "count": 3
}
```

---

## 5. Filter Claims by Status

**Endpoint:** `GET /api/claims?status={status}`

**Query Parameters:**
- `status` (optional): submitted | inReview | approved | rejected

**cURL:**
```bash
curl "http://localhost:3000/api/claims?status=submitted" \
  -H "x-user-id: 2"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "status": "submitted",
      // ... other fields
    }
  ],
  "count": 1
}
```

---

## 6. Sort Claims

**Endpoint:** `GET /api/claims?sortBy={field}&sortOrder={order}`

**Query Parameters:**
- `sortBy` (optional): created_at | date_of_occurrence (default: created_at)
- `sortOrder` (optional): ASC | DESC (default: DESC)

**cURL:**
```bash
# Sort by occurrence date, oldest first
curl "http://localhost:3000/api/claims?sortBy=date_of_occurrence&sortOrder=ASC" \
  -H "x-user-id: 2"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    // Sorted by date_of_occurrence ASC
  ],
  "count": 3
}
```

---

## 7. Get Single Claim

**Endpoint:** `GET /api/claims/:id`

**Headers:**
```
x-user-id: 1 or 2
```

**cURL:**
```bash
curl http://localhost:3000/api/claims/1 \
  -H "x-user-id: 2"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "policy_id": "POL-12345",
    "date_of_occurrence": "2026-01-15",
    "location": "123 Main St, New York, NY",
    "cause": "Accident",
    "description": "Vehicle collision at intersection.",
    "status": "inReview",
    "documents": [],
    "created_at": "2026-01-19 18:20:49",
    "updated_at": "2026-01-19 18:21:05"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Claim not found"
}
```

---

## 8. Update Claim Status (Admin Only)

**Endpoint:** `PATCH /api/claims/:id`

**Headers:**
```
x-user-id: 2
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "inReview"
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/claims/1 \
  -H "x-user-id: 2" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "policy_id": "POL-12345",
    "date_of_occurrence": "2026-01-15",
    "location": "123 Main St, New York, NY",
    "cause": "Accident",
    "description": "Vehicle collision at intersection.",
    "status": "approved",
    "documents": [],
    "created_at": "2026-01-19 18:20:49",
    "updated_at": "2026-01-19 18:25:30"
  }
}
```

**Error Response (403 Forbidden - Non-admin user):**
```json
{
  "success": false,
  "error": "Only administrators can update claim status"
}
```

**Error Response (400 Bad Request - Invalid status):**
```json
{
  "success": false,
  "error": "Invalid status. Must be one of: submitted, inReview, approved, rejected"
}
```

---

## 9. Health Check

**Endpoint:** `GET /api/health`

**cURL:**
```bash
curl http://localhost:3000/api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-01-19T18:20:38.040Z"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Policy ID is required; Location is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Only administrators can update claim status"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Claim not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Testing Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=== Testing Claims API ==="
echo ""

echo "1. Creating claim..."
curl -X POST $BASE_URL/claims \
  -H "x-user-id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "policyId": "POL-TEST-123",
    "dateOfOccurrence": "2026-01-19",
    "location": "Test Location",
    "cause": "Accident",
    "description": "API test claim"
  }' | jq '.'

echo ""
echo "2. Listing all claims (admin)..."
curl -s $BASE_URL/claims \
  -H "x-user-id: 2" | jq '.count'

echo ""
echo "3. Updating claim status..."
curl -X PATCH $BASE_URL/claims/1 \
  -H "x-user-id: 2" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}' | jq '.data.status'

echo ""
echo "4. Filtering by status..."
curl -s "$BASE_URL/claims?status=approved" \
  -H "x-user-id: 2" | jq '.count'

echo ""
echo "=== Tests Complete ==="
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Claims Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Claim",
      "request": {
        "method": "POST",
        "header": [
          {"key": "x-user-id", "value": "1"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"policyId\": \"POL-12345\",\n  \"dateOfOccurrence\": \"2026-01-15\",\n  \"location\": \"Test Location\",\n  \"cause\": \"Accident\",\n  \"description\": \"Test claim\"\n}"
        },
        "url": "http://localhost:3000/api/claims"
      }
    },
    {
      "name": "List Claims (Admin)",
      "request": {
        "method": "GET",
        "header": [
          {"key": "x-user-id", "value": "2"}
        ],
        "url": "http://localhost:3000/api/claims"
      }
    },
    {
      "name": "Update Claim Status",
      "request": {
        "method": "PATCH",
        "header": [
          {"key": "x-user-id", "value": "2"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"status\": \"approved\"}"
        },
        "url": "http://localhost:3000/api/claims/1"
      }
    }
  ]
}
```
