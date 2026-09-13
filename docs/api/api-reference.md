# CirculateX — API Reference

> **Base URL (development):** http://localhost:5000/api
> **Authentication:** JWT Bearer token in Authorization header, except where noted.
> **Response format:** All responses are JSON with consistent envelope.

---

## Response Envelope

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

### Error
```json
{
  "success": false,
  "error": "SHORT_CODE",
  "message": "Human-readable error message"
}
```

### Why a consistent envelope?
Every response has the same shape. The frontend can always check `response.success` and either use `response.data` or display `response.message`. This prevents bugs where the frontend tries to read a field from an error response.

---

## Health Check

### GET /api/health
**Auth:** None
**Purpose:** Confirm the server and database are running.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-09-13T17:36:48.000Z",
    "database": "connected"
  }
}
```

---

## Auth Routes (/api/auth)

### POST /api/auth/register
**Auth:** None (public)
**Purpose:** Create a new user account.

**Request Body:**
```json
{
  "name": "Shahadat Hussain",
  "email": "shahadat@example.com",
  "password": "MySecurePass123!",
  "phone": "+91-9876543210",
  "location": "Bangalore"
}
```

**Validation Rules:**
- `name`: required, 2-50 chars
- `email`: required, valid email format, must be unique
- `password`: required, min 8 chars, at least 1 uppercase, 1 number
- `phone`: optional
- `location`: optional

**Response (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "_id": "...",
      "name": "Shahadat Hussain",
      "email": "shahadat@example.com",
      "location": "Bangalore"
    }
  },
  "message": "Account created successfully"
}
```

**Error responses:**
- 400: Validation failed
- 409: Email already registered

**Security:** Password is hashed with bcrypt (cost factor 12) before saving. Never returned in response.

---

### POST /api/auth/login
**Auth:** None (public)
**Purpose:** Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "shahadat@example.com",
  "password": "MySecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "_id": "...",
      "name": "Shahadat Hussain",
      "email": "shahadat@example.com",
      "location": "Bangalore"
    }
  }
}
```

**Note:** Refresh token is set as an httpOnly cookie (not in JSON body).

**Error responses:**
- 400: Missing fields
- 401: Invalid email or password (same message for both — prevents user enumeration)

---

### GET /api/auth/me
**Auth:** Required (Bearer token)
**Purpose:** Get the currently logged-in user's profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Shahadat Hussain",
    "email": "shahadat@example.com",
    "location": "Bangalore",
    "createdAt": "2026-09-13T..."
  }
}
```

---

### POST /api/auth/refresh
**Auth:** Refresh token in httpOnly cookie
**Purpose:** Get a new access token using the refresh token.

**Response (200):**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGciOiJIUzI1NiJ9..." }
}
```

---

### POST /api/auth/logout
**Auth:** Required
**Purpose:** Invalidate the refresh token and clear the cookie.

**Response (200):**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

## Listings Routes (/api/listings)

### GET /api/listings
**Auth:** None (public)
**Purpose:** Browse all listings with optional search, filter, and sort.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| search | string | Text search in title, description, category |
| category | string | Filter by category enum value |
| sort | string | `newest`, `oldest`, `price-asc`, `price-desc`, `rating` |
| available | boolean | Filter by availability (default: show all) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 50) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listings": [ { ...listing fields... } ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 147,
      "pages": 8
    }
  }
}
```

---

### GET /api/listings/:id
**Auth:** None (public)
**Purpose:** Get full detail for a single listing.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Sony A7 IV Camera",
    "description": "...",
    "category": "Cameras",
    "pricePerDay": 800,
    "deposit": 15000,
    "available": true,
    "lender": {
      "_id": "...",
      "name": "Arjun M.",
      "location": "Koramangala",
      "rating": 4.9,
      "totalLends": 38
    }
  }
}
```

**Error responses:**
- 404: Listing not found

---

### POST /api/listings
**Auth:** Required
**Purpose:** Create a new listing.

**Request Body:**
```json
{
  "title": "Sony A7 IV Camera",
  "description": "Professional mirrorless camera...",
  "category": "Cameras",
  "pricePerDay": 800,
  "deposit": 15000
}
```

**Validation:**
- title: required, 3-100 chars
- description: required, 10-1000 chars
- category: required, must be in allowed enum
- pricePerDay: required, number > 0
- deposit: required, number >= 0

**Response (201):** Returns the created listing.

---

### PATCH /api/listings/:id
**Auth:** Required, must be the listing owner
**Purpose:** Update a listing.

**Authorization check:** `listing.lenderId.toString() === req.user._id.toString()`

**Request Body:** Any subset of listing fields (partial update).

**Error responses:**
- 403: You can only edit your own listings
- 404: Listing not found

---

### DELETE /api/listings/:id
**Auth:** Required, must be the listing owner
**Purpose:** Remove a listing.

**Business rule:** Cannot delete a listing with an ACTIVE borrow request.

**Error responses:**
- 403: Not your listing
- 409: Cannot delete a listing with an active borrow

---

### GET /api/listings/my
**Auth:** Required
**Purpose:** Get all listings created by the current user.

**Response (200):** Same as GET /api/listings but filtered to current user.

---

## Borrow Request Routes (/api/requests)

### POST /api/requests
**Auth:** Required
**Purpose:** Send a borrow request to a lender.

**Request Body:**
```json
{
  "listingId": "...",
  "startDate": "2026-10-01",
  "endDate": "2026-10-04",
  "message": "Hi, I need this for a weekend shoot"
}
```

**Business rules:**
- Cannot borrow your own listing
- startDate must be today or future
- endDate must be after startDate
- Listing must be available (no active request in overlapping dates)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "listingId": "...",
    "status": "PENDING",
    "totalDays": 3,
    "totalCost": 2400,
    "depositAmount": 15000
  }
}
```

---

### GET /api/requests/outgoing
**Auth:** Required
**Purpose:** Get all borrow requests I have sent (as borrower).

---

### GET /api/requests/incoming
**Auth:** Required
**Purpose:** Get all borrow requests others have sent for my listings (as lender).

---

### PATCH /api/requests/:id/approve
**Auth:** Required, must be the lender
**Purpose:** Approve a borrow request. Triggers escrow hold.

**What happens:**
1. BorrowRequest status → APPROVED
2. Listing available → false
3. EscrowTransaction created with status HELD

**Error responses:**
- 403: You can only approve requests for your own listings
- 409: Request is not in PENDING state

---

### PATCH /api/requests/:id/reject
**Auth:** Required, must be the lender
**Purpose:** Reject a borrow request.

**What happens:**
1. BorrowRequest status → REJECTED

---

## Escrow Routes (/api/escrow)

### POST /api/escrow/release
**Auth:** Required, must be the lender
**Purpose:** Confirm item has been returned safely. Releases deposit back to borrower.

**Request Body:**
```json
{ "requestId": "..." }
```

**What happens:**
1. BorrowRequest status → RETURNED
2. EscrowTransaction status → RELEASED
3. Listing available → true

---

## Business Flow Summary

```
Register/Login
  → Browse Marketplace (GET /api/listings)
  → View Item Detail (GET /api/listings/:id)
  → Send Borrow Request (POST /api/requests)
  → Lender Approves (PATCH /api/requests/:id/approve)
    → Deposit Locked (escrow HELD)
    → Coordinate handover (offline)
  → Lender Confirms Return (POST /api/escrow/release)
    → Deposit Released
    → Listing Available Again
```
