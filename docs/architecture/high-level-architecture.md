# CirculateX — High-Level Architecture

> This document describes the system architecture at a conceptual level.
> Updated as the system grows.

---

## Current Architecture (Phase 1 — MVP)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│                                                                     │
│   React 19 + Vite                                                   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│   │ HomePage │  │MainPage  │  │LendPage  │  │  DashboardPage   │  │
│   │          │  │(Marketplace│ │BorrowPage│  │                  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
│                       ↑                                             │
│               AppContext (React Context)                            │
│           Holds: listings, user, toasts                             │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS REST API (JSON)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVER                                │
│                                                                     │
│   Node.js + Express.js                                              │
│                                                                     │
│   Middleware Stack:                                                 │
│   helmet → cors → morgan → express.json → [route-specific auth]    │
│                                                                     │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│   │ Auth Routes │  │Listing Routes│  │   Request Routes        │  │
│   │ /api/auth/* │  │/api/listings/│  │   /api/requests/*       │  │
│   └──────┬──────┘  └──────┬───────┘  └────────────┬────────────┘  │
│          │                │                         │               │
│   ┌──────▼────────────────▼─────────────────────────▼────────────┐ │
│   │                    Controllers                                │ │
│   │  authController  listingController  requestController        │ │
│   └──────────────────────────┬────────────────────────────────────┘ │
│                              │                                      │
│   ┌──────────────────────────▼────────────────────────────────────┐ │
│   │                    Mongoose Models                            │ │
│   │        User    Listing    BorrowRequest    EscrowTransaction  │ │
│   └──────────────────────────┬────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ MongoDB Wire Protocol
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE                                    │
│                                                                     │
│   MongoDB (MongoDB Atlas — cloud, or local for dev)                 │
│                                                                     │
│   Collections:                                                      │
│   users  |  listings  |  borrowrequests  |  escrowtransactions     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow — Borrow Request Lifecycle

```
1. Borrower opens Marketplace  →  GET /api/listings  →  MongoDB query
2. Borrower clicks item        →  GET /api/listings/:id
3. Borrower submits request    →  POST /api/requests
                                   ↓
                               Auth middleware verifies JWT
                                   ↓
                               Controller validates: dates valid, not own item, not already active
                                   ↓
                               BorrowRequest created (status: PENDING)
                                   ↓
                               Response: 201 Created

4. Lender views incoming       →  GET /api/requests/incoming
5. Lender approves             →  PATCH /api/requests/:id/approve
                                   ↓
                               Auth middleware + authorization check (must be lender)
                                   ↓
                               BorrowRequest status → APPROVED
                               Listing available → false
                               EscrowTransaction created (status: HELD)
                                   ↓
                               Response: 200 OK

6. Item returned               →  POST /api/escrow/release
                                   ↓
                               BorrowRequest status → RETURNED
                               EscrowTransaction status → RELEASED
                               Listing available → true
```

---

## Backend Folder Structure (Target)

```
Backend/
├── src/
│   ├── server.js            ← Express app setup, middleware registration
│   ├── config/
│   │   ├── db.js            ← MongoDB connection
│   │   └── env.js           ← Environment variable validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   ├── BorrowRequest.js
│   │   └── EscrowTransaction.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── requestController.js
│   │   └── escrowController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── requestRoutes.js
│   │   └── escrowRoutes.js
│   ├── middleware/
│   │   ├── auth.js          ← JWT verification, attaches req.user
│   │   ├── validate.js      ← Request body validation (express-validator)
│   │   └── errorHandler.js  ← Global error handler
│   └── utils/
│       ├── response.js      ← sendSuccess() and sendError() helpers
│       └── asyncHandler.js  ← Wraps async controllers to catch errors
├── .env                     ← Environment variables (gitignored)
├── .env.example             ← Template for env vars (committed)
└── package.json
```

### Why this folder structure?

**routes/** contains only route definitions (HTTP verb + path + middleware chain). No business logic.

**controllers/** contains the request/response logic. Reads from req, calls models, sends res. No raw DB queries.

**models/** contains Mongoose schemas and model definitions. Only database structure.

**middleware/** contains reusable request pipeline functions.

**utils/** contains pure functions with no HTTP context (can be unit tested easily).

**Why this separation matters:**
Each layer has one responsibility. If you need to change how a response is formatted, you change `utils/response.js`. If you need to change database structure, you change `models/`. You never need to touch routes to fix a business logic bug.

---

## Security Architecture

### Headers (helmet)
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff (MIME type sniffing protection)
- Content-Security-Policy (XSS protection)

### CORS
- Only allow requests from the frontend origin (localhost:5173 in dev)
- credentials: true (allows cookies)

### Authentication flow
```
Client                          Server
  │                                │
  ├─── POST /api/auth/login ───────►│
  │    { email, password }         │
  │                                │── verify password with bcrypt
  │                                │── generate accessToken (15min)
  │◄── { accessToken, user } ──────│── generate refreshToken (7d) → httpOnly cookie
  │    Set-Cookie: refreshToken     │
  │                                │
  ├─── GET /api/listings/my ───────►│
  │    Authorization: Bearer <jwt> │
  │                                │── auth middleware: verify JWT signature
  │                                │── attach req.user = decoded payload
  │◄── { listings } ───────────────│
```

---

## Non-Functional Requirements

| Requirement | Target | Current Status |
|---|---|---|
| API response time | < 200ms (p95) for simple queries | Not measured yet |
| Uptime | 99% for MVP | Not deployed |
| Auth token security | httpOnly cookie for refresh token | Planned |
| Password security | bcrypt cost 12 | Planned |
| Input validation | All request bodies validated | Planned |
| Error handling | Global handler, consistent format | Planned |

---

## What this architecture does NOT include (and why)

| Missing component | Why it is NOT included yet |
|---|---|
| CDN / File storage | No image upload yet |
| Email service | Post-MVP feature |
| Redis / Cache | No performance bottleneck identified |
| Message queue | Not needed for synchronous MVP |
| WebSockets | Polling is sufficient |
| Multiple servers | Single server is fine at this scale |
| Load balancer | No traffic to justify it |
