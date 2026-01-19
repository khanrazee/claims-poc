# Quick Start Guide

## Installation & Setup (30 seconds)

```bash
npm install
npm start
```

Server will start on `http://localhost:3000`

## Demo the Application

### 1. Customer Portal - Submit Claims
Visit: http://localhost:3000?policyId=POL-12345

- Fill out the claim form
- Upload documents (optional)
- Submit claim
- See success confirmation with Claim ID

### 2. Admin Portal - Manage Claims
Visit: http://localhost:3000/admin

**Features to demo:**
- ✅ View all submitted claims in a professional data grid
- ✅ Use quick search bar to search across all fields
- ✅ Filter by status using column filters
- ✅ Sort by any column (click column header)
- ✅ Update claim status via inline dropdown
- ✅ Export data to CSV
- ✅ Pagination for large datasets
- ✅ Resize and reorder columns

### 3. API Testing

**Create a claim:**
```bash
curl -X POST http://localhost:3000/api/claims \
  -H "x-user-id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "policyId": "POL-99999",
    "dateOfOccurrence": "2026-01-15",
    "location": "Test Location",
    "cause": "Accident",
    "description": "Test claim description"
  }'
```

**List all claims (admin):**
```bash
curl http://localhost:3000/api/claims -H "x-user-id: 2"
```

**Update claim status:**
```bash
curl -X PATCH http://localhost:3000/api/claims/1 \
  -H "x-user-id: 2" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

**Filter by status:**
```bash
curl "http://localhost:3000/api/claims?status=submitted" -H "x-user-id: 2"
```

## Authentication Notes

For demo purposes, we use simple header-based auth:
- `x-user-id: 1` = Customer (can only see their own claims)
- `x-user-id: 2` = Admin (can see all claims and update status)

## Project Structure

```
case-poc/
├── src/
│   ├── controllers/        # REST API controllers
│   ├── services/           # Business logic layer
│   ├── repositories/       # Data access layer
│   ├── middleware/         # Authentication middleware
│   └── routes/             # API route definitions
├── public/
│   ├── customer.html       # Customer claim submission UI
│   └── admin-enhanced.html # Admin dashboard with AG Grid
├── uploads/                # Uploaded documents
└── claims.db              # SQLite database

```

## Key Features Implemented

✅ Customer claim submission with validation
✅ File upload support
✅ RESTful API with proper error handling
✅ Repository pattern for data access
✅ Service layer for business logic
✅ User scoping (customers see only their claims)
✅ Admin-only status updates
✅ Enterprise-grade admin interface with AG Grid
✅ Filter, sort, and search capabilities
✅ CSV export functionality
✅ SQLite persistence

## Next Steps (If More Time)

1. Add JWT authentication
2. Implement realtime updates (SSE/WebSockets)
3. Add location autocomplete
4. Calculate risk scores
5. Add unit tests
6. Docker containerization
7. Email notifications
8. Audit logs
