# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
├──────────────────────┬──────────────────────────────────────┤
│  Customer Portal     │     Admin Portal (AG Grid)           │
│  customer.html       │     admin-enhanced.html              │
│                      │                                       │
│  • Claim submission  │  • View all claims                   │
│  • File upload       │  • Advanced filtering                │
│  • Form validation   │  • Status updates                    │
│                      │  • Export to CSV                     │
└──────────────────────┴──────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Express)                       │
├─────────────────────────────────────────────────────────────┤
│  Routes (claimRoutes.js)                                    │
│  ├── POST   /api/claims                                     │
│  ├── GET    /api/claims                                     │
│  ├── GET    /api/claims/:id                                 │
│  └── PATCH  /api/claims/:id                                 │
│                                                              │
│  Middleware                                                  │
│  ├── Authentication (auth.js)                               │
│  ├── File Upload (multer)                                   │
│  └── CORS, JSON parsing                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               CONTROLLER LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  claimController.js                                          │
│  ├── createClaim()     - Handle POST requests               │
│  ├── listClaims()      - Handle GET requests                │
│  ├── getClaim()        - Handle GET by ID                   │
│  └── updateClaimStatus() - Handle PATCH requests            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               SERVICE LAYER (Business Logic)                 │
├─────────────────────────────────────────────────────────────┤
│  claimService.js                                             │
│  ├── submitClaim()         - Validation + create            │
│  ├── getClaims()           - Apply filters                  │
│  ├── getClaimById()        - Retrieve single claim          │
│  ├── updateClaimStatus()   - Validate + update              │
│  └── validateClaimData()   - Input validation               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            REPOSITORY LAYER (Data Access)                    │
├─────────────────────────────────────────────────────────────┤
│  claimRepository.js                                          │
│  ├── create()          - Insert claim                       │
│  ├── findById()        - Get by ID (scoped)                 │
│  ├── findAll()         - List with filters (scoped)         │
│  └── updateStatus()    - Update status (scoped)             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  SQLite (better-sqlite3)                                     │
│  database.js - Initialization & schema                       │
│                                                              │
│  Tables:                                                     │
│  ├── users (id, email, role, created_at)                    │
│  └── claims (id, user_id, policy_id, date_of_occurrence,   │
│              location, cause, description, status,           │
│              documents, created_at, updated_at)              │
│                                                              │
│  Indexes:                                                    │
│  ├── idx_claims_user_id                                     │
│  ├── idx_claims_status                                      │
│  └── idx_claims_created_at                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  FILE STORAGE                                │
├─────────────────────────────────────────────────────────────┤
│  uploads/                                                    │
│  ├── {timestamp}-{random}.pdf                               │
│  ├── {timestamp}-{random}.jpg                               │
│  └── ...                                                     │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

### Creating a Claim

```
User fills form
    │
    └──> POST /api/claims (with files)
            │
            ├──> Middleware: authenticate(x-user-id)
            │
            ├──> Middleware: multer (file upload)
            │
            └──> Controller: claimController.createClaim()
                    │
                    └──> Service: claimService.submitClaim()
                            │
                            ├──> Validate input
                            │
                            └──> Repository: claimRepository.create()
                                    │
                                    └──> Database: INSERT INTO claims
                                            │
                                            └──> Response: 201 Created
```

### Updating Claim Status (Admin)

```
Admin clicks dropdown
    │
    └──> PATCH /api/claims/:id
            │
            ├──> Middleware: authenticate(x-user-id=2)
            │
            └──> Controller: claimController.updateClaimStatus()
                    │
                    └──> Service: claimService.updateClaimStatus()
                            │
                            ├──> Check if admin
                            │
                            ├──> Validate status
                            │
                            └──> Repository: claimRepository.updateStatus()
                                    │
                                    └──> Database: UPDATE claims WHERE id=?
                                            │
                                            └──> Response: 200 OK
```

## Security Model

### User Scoping

```
┌──────────────┬─────────────────┬───────────────────────┐
│ User Type    │ Can See         │ Can Update            │
├──────────────┼─────────────────┼───────────────────────┤
│ Customer     │ Own claims only │ Nothing               │
│ (user_id=1)  │ WHERE user_id=1 │                       │
├──────────────┼─────────────────┼───────────────────────┤
│ Admin        │ All claims      │ Status of any claim   │
│ (user_id=2)  │ No WHERE clause │                       │
└──────────────┴─────────────────┴───────────────────────┘
```

### Data Validation

```
┌─────────────────────────────────────────────────────────┐
│               VALIDATION LAYERS                          │
├─────────────────────────────────────────────────────────┤
│  1. Frontend (HTML5)                                     │
│     ├── Required fields                                  │
│     ├── Date constraints                                 │
│     └── File type/size                                   │
│                                                          │
│  2. Controller (Express)                                 │
│     └── Parse multipart/form-data                        │
│                                                          │
│  3. Service Layer                                        │
│     ├── Business rule validation                         │
│     ├── Enum validation (cause, status)                  │
│     └── Required field checking                          │
│                                                          │
│  4. Repository (Database)                                │
│     ├── Type constraints                                 │
│     ├── CHECK constraints                                │
│     └── Foreign key constraints                          │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Customer   │
└──────┬───────┘
       │ 1. Submit claim
       ▼
┌──────────────────────┐
│  Customer Portal     │
│  • Form validation   │
│  • File attachment   │
└──────────┬───────────┘
           │ 2. POST /api/claims
           ▼
┌──────────────────────────────┐
│     REST API                 │
│  • Auth check (customer)     │
│  • File upload               │
│  • Validation                │
└──────────┬───────────────────┘
           │ 3. Create in DB
           ▼
┌──────────────────────────────┐
│     SQLite Database          │
│  • Store claim               │
│  • Link to user_id           │
│  • Status = "submitted"      │
└──────────┬───────────────────┘
           │
           │ 4. Notify admin (future)
           ▼
┌──────────────────────────────┐
│     Admin Portal             │
│  • Auto-refresh (future)     │
│  • Show new claim            │
└──────────┬───────────────────┘
           │ 5. Admin reviews
           ▼
┌──────────────────────────────┐
│     Admin Action             │
│  • Update status             │
│  • inReview → approved       │
└──────────┬───────────────────┘
           │ 6. PATCH /api/claims/:id
           ▼
┌──────────────────────────────┐
│     REST API                 │
│  • Auth check (admin)        │
│  • Validate status           │
└──────────┬───────────────────┘
           │ 7. Update in DB
           ▼
┌──────────────────────────────┐
│     SQLite Database          │
│  • Update status             │
│  • Set updated_at            │
└──────────────────────────────┘
```

## Technology Choices

| Component | Technology | Reasoning |
|-----------|-----------|-----------|
| **Web Framework** | Express | Minimal, fast, widely used |
| **Database** | SQLite | Zero config, embedded |
| **ORM/Query Builder** | None (raw SQL) | Direct control, no overhead |
| **File Upload** | Multer | Standard for Express |
| **Admin UI** | AG Grid Community | Enterprise-grade, free |
| **Frontend** | Vanilla JS | No build step, fast |
| **Auth** | Header-based | Demo simplicity |

## Scalability Considerations

### Current Architecture
- Handles ~1000 concurrent users
- SQLite limits: ~100k writes/sec
- File storage: Disk-based

### Production Upgrades
```
┌────────────────────────────────────────────────────────┐
│ Component       │ Current      │ Production           │
├─────────────────┼──────────────┼──────────────────────┤
│ Database        │ SQLite       │ PostgreSQL cluster   │
│ File Storage    │ Local disk   │ AWS S3 / R2          │
│ Auth            │ Header       │ JWT + Redis sessions │
│ Cache           │ None         │ Redis                │
│ Load Balancer   │ Single node  │ NGINX + PM2          │
│ API             │ Single server│ Microservices        │
└────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Error occurs at any layer
    │
    ├──> Database error
    │    └──> Repository catches → throw specific error
    │
    ├──> Validation error
    │    └──> Service catches → throw with message
    │
    └──> Business logic error
         └──> Service catches → throw with context
              │
              └──> Controller catches all
                      │
                      └──> Format error response
                          {
                            success: false,
                            error: "Human readable message"
                          }
```

## Performance Optimization

### Database Indexes
```sql
-- User-based queries (most common)
CREATE INDEX idx_claims_user_id ON claims(user_id);

-- Status filtering (admin view)
CREATE INDEX idx_claims_status ON claims(status);

-- Sorting by date
CREATE INDEX idx_claims_created_at ON claims(created_at);
```

### Query Optimization
- Use prepared statements (prevents SQL injection + faster)
- Select only needed columns
- Pagination for large result sets (future)
- Composite indexes for common filter combinations (future)

## Monitoring & Observability (Future)

```
┌─────────────────────────────────────────────────┐
│               Observability Stack               │
├─────────────────────────────────────────────────┤
│  Logs      → Winston + CloudWatch              │
│  Metrics   → Prometheus + Grafana               │
│  Tracing   → OpenTelemetry                      │
│  Errors    → Sentry                             │
│  Uptime    → Pingdom                            │
└─────────────────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
┌────────────────────────────────────────────────────────┐
│                      Internet                          │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│              CloudFlare CDN + WAF                      │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│              Load Balancer (NGINX)                     │
└──────┬──────────────────────┬──────────────────────────┘
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│  App Server  │      │  App Server  │
│  (Node.js)   │      │  (Node.js)   │
└──────┬───────┘      └──────┬───────┘
       │                     │
       └─────────┬───────────┘
                 ▼
┌────────────────────────────────────┐
│     PostgreSQL Primary             │
│     + Read Replicas                │
└────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────┐
│  1. Network Layer                               │
│     • HTTPS only                                │
│     • CloudFlare DDoS protection                │
├─────────────────────────────────────────────────┤
│  2. Application Layer                           │
│     • Input validation                          │
│     • SQL injection prevention                  │
│     • File upload restrictions                  │
├─────────────────────────────────────────────────┤
│  3. Authentication Layer                        │
│     • JWT tokens                                │
│     • Role-based access control                 │
│     • Session management                        │
├─────────────────────────────────────────────────┤
│  4. Data Layer                                  │
│     • User scoping in queries                   │
│     • Encrypted at rest                         │
│     • Backup encryption                         │
└─────────────────────────────────────────────────┘
```
