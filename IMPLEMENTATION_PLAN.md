# Implementation Plan for Enhanced Features

## Status: IN PROGRESS ⚙️

### Completed ✅
1. **Database Schema Updated**
   - Added password_hash, first_name, last_name, is_active, invite_token to users table
   - Added assigned_agent_id, status_note to claims table
   - Added 'cancelled' status to claim status enum
   - Created claim_status_history table for audit trail
   - Added all necessary indexes

2. **State Machine Created**
   - Claim status transitions defined
   - Terminal states enforced (rejected, cancelled, approved cannot transition)
   - Validation logic implemented

3. **User Repository Created**
   - User CRUD operations
   - Invite token generation
   - Password hashing with bcrypt
   - Account activation logic

4. **Claim Repository Updated**
   - Agent assignment support
   - Status notes support
   - Status history tracking
   - JOIN queries to fetch agent/customer info

### Remaining Tasks 🔨

#### 1. Authentication System (30-45 min)
- [ ] JWT token generation and verification service
- [ ] Login endpoint (POST /api/auth/login)
- [ ] Token refresh endpoint
- [ ] Update middleware to use JWT instead of x-user-id header
- [ ] Logout functionality

#### 2. User Management in Admin (25-30 min)
- [ ] User service layer
- [ ] User controller with endpoints:
  - POST /api/users - Create user with invite
  - GET /api/users - List all users
  - GET /api/users/:id - Get user details
  - PATCH /api/users/:id - Update user
  - DELETE /api/users/:id - Deactivate user
- [ ] Admin UI for user management

#### 3. Email Invitation System (20-25 min)
- [ ] Email service using nodemailer
- [ ] Email templates for invitations
- [ ] POST /api/auth/accept-invite/:token endpoint
- [ ] Password setup page
- [ ] Email configuration (SMTP settings)

#### 4. Enhanced Claim Service (15-20 min)
- [ ] Integrate state machine validation
- [ ] Update claim service to use new repository methods
- [ ] Agent assignment logic
- [ ] Status note requirements

#### 5. Enhanced Claim Controller (15-20 min)
- [ ] Update endpoints to handle notes
- [ ] POST /api/claims/:id/assign - Assign agent
- [ ] GET /api/claims/:id/history - Get status history
- [ ] Enforce authentication (JWT required)

#### 6. Customer Claims History View (30-35 min)
- [ ] New customer dashboard page
- [ ] Show all user's claims with status
- [ ] Display assigned agent info
- [ ] Show status notes for rejected/cancelled claims
- [ ] Timeline view of claim progress

#### 7. Updated Admin Interface (40-50 min)
- [ ] User management tab in admin
- [ ] Send invite functionality
- [ ] Agent assignment dropdown in claims grid
- [ ] Status note input when rejecting/cancelling
- [ ] Status history modal/panel
- [ ] Validation for state transitions

#### 8. Login/Signup Pages (25-30 min)
- [ ] Login page with email/password
- [ ] Password setup page (invite acceptance)
- [ ] Session management
- [ ] Protected routes

### Total Additional Time Estimate
**~3-4 hours** for complete implementation

## Current State
- Database: ✅ Ready
- Repositories: ✅ Ready
- State Machine: ✅ Ready
- Services: ⚙️ Needs updates
- Controllers: ⚙️ Needs updates
- Frontend: ⚙️ Major updates needed
- Auth System: ❌ Not started

## Quick Decision Points

### Option A: Full Implementation (3-4 hours)
Implement all features as specified with:
- Complete JWT authentication
- Email invitations
- Full UI overhaul
- All state machine enforcements

### Option B: MVP Features (1-1.5 hours)
Implement core functionality only:
- Basic JWT auth
- User management in admin (no email invites yet)
- Claim history view for customers
- Agent assignment
- Status notes
- State machine validation

Skip for later:
- Email invitation system (use manual password setup)
- Complex UI features
- Real-time updates

### Option C: Documentation & Architecture (30 min)
Create detailed specs and let you implement:
- Complete API documentation
- Frontend wireframes
- Implementation guide
- Migration path from current system

## What Would You Like Me To Do?

Please let me know which option you prefer, or if you'd like a custom combination of features!
