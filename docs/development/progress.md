# CirculateX — Project Progress

> **Last updated:** September 13, 2026  
> **Status:** Backend Milestone 1-4 COMPLETE. Milestone 5 COMPLETE.

---

## MILESTONE STATUS

| # | Milestone | Status |
|---|---|---|
| 1 | Backend Foundation | DONE |
| 2 | Authentication (Register, Login, JWT, Refresh, Logout) | DONE |
| 3 | Listings API (CRUD + search + filter + pagination) | DONE |
| 4 | Borrow Requests API (create + approve + reject) | DONE |
| 5 | Escrow State Machine (hold + release) | DONE |
| 6 | Frontend integration (replace mock data with real APIs) | NOT STARTED |
| 7 | Auth UI (Login/Register pages) | NOT STARTED |
| 8 | React-router for protected routes | NOT STARTED |
| 9 | AI features | NOT STARTED |
| 10 | Tests (Jest) | NOT STARTED |

---

## WHAT IS BUILT

### Backend (Complete)

```
Backend/
├── src/
│   ├── server.js            ← Express app (helmet, cors, morgan, json, cookieParser)
│   ├── config/db.js         ← MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js          ← Schema, comparePassword(), toSafeObject()
│   │   ├── Listing.js       ← Schema, compound indexes
│   │   ├── BorrowRequest.js ← State machine model, denormalized lenderId
│   │   └── EscrowTransaction.js ← Financial audit record
│   ├── controllers/
│   │   ├── authController.js    ← Register, login (timing attack prevention), refresh, logout
│   │   ├── listingController.js ← Full CRUD, pagination, regex search, authorization
│   │   ├── requestController.js ← Create, approve (+ escrow), reject, incoming/outgoing
│   │   └── escrowController.js  ← Release (+ listing restore + lend count)
│   ├── routes/
│   │   ├── authRoutes.js    ← Validation + route definitions
│   │   ├── listingRoutes.js ← Route order: /my before /:id (critical)
│   │   ├── requestRoutes.js
│   │   └── escrowRoutes.js
│   ├── middleware/
│   │   ├── auth.js          ← JWT protect middleware, attaches req.user
│   │   └── errorHandler.js  ← Global handler: Mongoose, JWT, CastError, 11000
│   └── utils/
│       ├── asyncHandler.js  ← Eliminates try/catch boilerplate
│       └── response.js      ← sendSuccess(), sendError() consistent envelope
├── .env                     ← Real Atlas URI + JWT secrets (gitignored)
├── .env.example             ← Template (committed)
└── package.json             ← node/nodemon start scripts
```

### API Endpoints (All Tested and Working)

| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | /api/health | None | DONE |
| POST | /api/auth/register | None | DONE |
| POST | /api/auth/login | None | DONE |
| GET | /api/auth/me | Required | DONE |
| POST | /api/auth/refresh | Cookie | DONE |
| POST | /api/auth/logout | Required | DONE |
| GET | /api/listings | None | DONE |
| GET | /api/listings/my | Required | DONE |
| GET | /api/listings/:id | None | DONE |
| POST | /api/listings | Required | DONE |
| PATCH | /api/listings/:id | Required + Owner | DONE |
| DELETE | /api/listings/:id | Required + Owner | DONE |
| POST | /api/requests | Required | DONE |
| GET | /api/requests/outgoing | Required | DONE |
| GET | /api/requests/incoming | Required | DONE |
| PATCH | /api/requests/:id/approve | Required + Lender | DONE |
| PATCH | /api/requests/:id/reject | Required + Lender | DONE |
| POST | /api/escrow/release | Required + Lender | DONE |
| GET | /api/escrow/my | Required | DONE |

### E2E Test Results (Manual — September 13, 2026)

```
LENDER LOGIN: Shahadat Hussain                         OK
BORROWER LOGIN: Rahul Kumar                            OK
LISTING: Sony A7 IV Full Frame Camera | available=True OK
REQUEST: status=PENDING | days=3 | cost=Rs2400 | deposit=Rs15000
APPROVED: request=APPROVED | escrow=HELD | Rs15000 HELD OK
LISTING AVAILABLE: False  (correctly unavailable)      OK
RELEASED: request=RETURNED | escrow=RELEASED           OK
LISTING AVAILABLE: True | totalLends=1                 OK
```

---

## TECHNICAL DECISIONS MADE DURING BUILD

1. bcrypt cost 12 for passwords, cost 8 for refresh token hash (different risk level)
2. Timing attack prevention on login (always run bcrypt.compare even for non-existent users)
3. lenderId denormalized in BorrowRequest for fast "incoming requests" query
4. Price snapshotted at request creation time (not re-read from listing)
5. GET /listings/my registered BEFORE GET /listings/:id to prevent 'my' being cast as ObjectId
6. Promise.all for parallel count + find queries on marketplace
7. $inc operator for atomic totalLends increment on listing
8. State machine transitions explicitly validated before each operation
9. Listing marked unavailable on approval, restored on release
10. EscrowTransaction created atomically with BorrowRequest approval

---

## WHAT TO BUILD NEXT

### Frontend Integration (Phase 3)

1. Install axios in Frontend
2. Create src/services/api.js — centralized Axios instance with interceptors
3. Create src/services/authService.js — register, login, logout, getMe
4. Create src/services/listingService.js — getAll, getMy, getOne, create
5. Create src/services/requestService.js — create, getOutgoing, getIncoming
6. Replace mock data in AppContext with real API calls
7. Add react-router v7 for URL-based routing + protected routes
8. Build Login page + Register page
9. Add loading states + error handling in UI

### After That

- Tests (Jest + Supertest for API tests)
- AI features (semantic search, description generator)
- Deployment (Railway or Render for backend, Vercel for frontend)
