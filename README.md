# Insurance Claims Management System

A full-stack application for insurance claims intake and triage with separate customer and admin interfaces.

## Features

### Customer Portal
- Submit insurance claims with form validation
- Pre-filled policy ID from URL parameter
- File upload support (images, PDFs, documents)
- Real-time success/error feedback
- Clean, modern UI

### Admin Portal (Enhanced with AG Grid)
- **Enterprise-grade data grid** using AG Grid Community Edition
- Advanced filtering, sorting, and searching capabilities
- Real-time quick search across all fields
- Inline status updates with dropdown
- Export to CSV functionality
- Column resizing and reordering
- Pagination for large datasets
- Floating filters for advanced querying
- Professional admin interface similar to ActiveAdmin/Retool

### Backend API
- RESTful architecture
- User authentication and scoping
- Repository pattern for data access
- Service layer for business logic
- SQLite database for persistence
- File upload handling with validation

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **File Upload**: Multer
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Admin Grid**: AG Grid Community (enterprise-grade data tables)
- **Authentication**: Simple header-based (x-user-id)

## Architecture

```
src/
├── controllers/      # REST controllers
├── services/         # Business logic layer
├── repositories/     # Data access layer
├── middleware/       # Auth and other middleware
└── routes/          # API route definitions

public/
├── customer.html    # Customer claim submission
└── admin.html       # Admin claims dashboard
```

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server runs on `http://localhost:3000`

## Usage

### Customer Portal
Visit: `http://localhost:3000?policyId=POL-12345`

The `policyId` parameter is required and will be pre-filled in the form.

### Admin Portal
Visit: `http://localhost:3000/admin`

## API Endpoints

### POST /api/claims
Create a new claim
- Headers: `x-user-id: 1` (customer)
- Body: multipart/form-data with claim fields and documents

### GET /api/claims
List all claims
- Headers: `x-user-id: 2` (admin)
- Query params: `status`, `sortBy`, `sortOrder`

### GET /api/claims/:id
Get a single claim
- Headers: `x-user-id: 1` or `2`

### PATCH /api/claims/:id
Update claim status (admin only)
- Headers: `x-user-id: 2` (admin)
- Body: `{ "status": "inReview" }`

## Data Model

### Claim
- id (auto-increment)
- user_id (foreign key to users)
- policy_id
- date_of_occurrence
- location
- cause (Accident, Theft, Damage, Delay-Interruption, Other)
- description
- status (submitted, inReview, approved, rejected)
- documents (JSON array of filenames)
- created_at
- updated_at

### User
- id
- email
- role (customer, admin)

## Security Features

- User scoping: Customers can only see their own claims
- Admin-only status updates
- File upload validation (type and size)
- SQL injection prevention with prepared statements
- Input validation in service layer

## Trade-offs and Design Decisions

1. **SQLite vs PostgreSQL**: Used SQLite for simplicity and zero configuration. Production should use PostgreSQL.

2. **Simple Auth**: Header-based auth (x-user-id) for demo purposes. Production needs JWT or session-based auth.

3. **No Frontend Framework**: Vanilla JS keeps it minimal and fast. Real app could use React/Vue.

4. **Synchronous Operations**: Used sync SQLite operations for simplicity. Async would be better for production.

5. **File Storage**: Files stored on disk. Production should use S3 or similar cloud storage.

6. **AG Grid for Admin**: Used AG Grid Community Edition (free, open-source) instead of building from scratch. Provides ActiveAdmin-like experience with enterprise features out-of-the-box. Could use AdminJS or Forest Admin for even more automated CRUD, but AG Grid gives more control and works perfectly with our REST API.

## What's Next (If More Time)

- [ ] JWT authentication
- [ ] Realtime updates with SSE or WebSockets
- [ ] Location autocomplete with Google Places API
- [ ] Risk score calculation based on claim attributes
- [ ] Pagination for large datasets
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] File preview functionality
- [ ] Email notifications
- [ ] Audit log for status changes
