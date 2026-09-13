# CirculateX — Database Schema Documentation

> **Database:** MongoDB (via Mongoose ODM)
> Every model is documented with its purpose, fields, reasoning, and trade-offs.

---

## Why MongoDB?

MongoDB stores data as JSON-like documents (called BSON). Instead of rows in a table, you have documents in a collection. This maps naturally to how our frontend works — we already think about listings as objects.

See ADR-005 for the full decision reasoning.

---

## Collection: users

**Purpose:** Stores registered users who can both lend and borrow items.

```
{
  _id:          ObjectId        (auto-generated, primary key)
  name:         String          REQUIRED, min 2 chars, max 50 chars
  email:        String          REQUIRED, unique, lowercase, validated format
  passwordHash: String          REQUIRED, bcrypt hash (never store plain password)
  phone:        String          OPTIONAL, for contact during handover
  location:     String          OPTIONAL, city/area for distance display
  avatar:       String          OPTIONAL, URL to profile image
  isVerified:   Boolean         DEFAULT false (for future email verification)
  refreshToken: String          OPTIONAL, current refresh token hash
  createdAt:    Date            AUTO (Mongoose timestamps)
  updatedAt:    Date            AUTO (Mongoose timestamps)
}
```

**Why these fields:**
- `email` is unique because it is the login identifier
- `passwordHash` — we NEVER store the plain password; bcrypt hash is stored
- `phone` — needed for real-world coordination (meeting for handover)
- `location` — enables "nearest first" sorting without a full geo system
- `refreshToken` — storing the current refresh token allows us to invalidate it on logout
- `isVerified` — placeholder for future email verification; defaults to false

**Indexes:**
- `email` — unique index (enforced by Mongoose `unique: true`)
  - Why: Every login query searches by email. Without an index, MongoDB scans every document.
  - Trade-off: Slight write overhead; completely worth it.

**What we deliberately excluded:**
- No `role` field yet (all users are both potential lenders and borrowers)
- No `balance` field (escrow is tracked separately)
- No address fields (location string is sufficient for MVP)

---

## Collection: listings

**Purpose:** Items that users have listed for others to borrow.

```
{
  _id:          ObjectId        (auto-generated)
  title:        String          REQUIRED, max 100 chars
  description:  String          REQUIRED, max 1000 chars
  category:     String          REQUIRED, enum: ['Electronics','Gaming','Cameras','Tools','Music','Books','Outdoor','Other']
  pricePerDay:  Number          REQUIRED, min 1 (in INR)
  deposit:      Number          REQUIRED, min 0 (security deposit in INR)
  lenderId:     ObjectId        REQUIRED, ref: 'User' — who owns this item
  images:       [String]        OPTIONAL, array of image URLs (empty for MVP, emoji placeholder)
  available:    Boolean         DEFAULT true
  location:     String          OPTIONAL, where item is located
  totalLends:   Number          DEFAULT 0 — how many times successfully lent
  rating:       Number          OPTIONAL, average rating from completed lends
  ratingCount:  Number          DEFAULT 0
  createdAt:    Date            AUTO
  updatedAt:    Date            AUTO
}
```

**Why these fields:**
- `lenderId` as ObjectId ref — links to the User collection; enables populate()
- `pricePerDay` + `deposit` separate — deposit is security, price is rental revenue
- `available` boolean — simple flag; set to false when a borrow request is approved
- `totalLends` and `rating` are denormalized for fast display on cards without joins
- `images` array — prepared for image upload; currently empty (emoji placeholder)

**Indexes:**
- `lenderId` — for "my listings" queries (`GET /api/listings/my`)
- `category` — for category filter queries
- `available` — for marketplace (show only available items)
- Compound: `{ category: 1, available: 1, createdAt: -1 }` — for filtered + sorted marketplace
  - Why: The most common marketplace query is "show me available Electronics, newest first"

**Potential scalability issue:**
If we have millions of listings, text search on `title` and `description` will be slow. Solution: MongoDB Atlas Search (built on Lucene) or later, a vector embedding index for semantic search.

---

## Collection: borrowrequests

**Purpose:** Tracks a borrow request from a borrower to a lender for a specific listing.

```
{
  _id:          ObjectId        (auto-generated)
  listingId:    ObjectId        REQUIRED, ref: 'Listing'
  borrowerId:   ObjectId        REQUIRED, ref: 'User'
  lenderId:     ObjectId        REQUIRED, ref: 'User' — denormalized from listing for faster queries
  startDate:    Date            REQUIRED
  endDate:      Date            REQUIRED
  totalDays:    Number          COMPUTED (endDate - startDate in days)
  totalCost:    Number          COMPUTED (totalDays * pricePerDay at time of request)
  depositAmount:Number          SNAPSHOT of deposit at time of request
  message:      String          OPTIONAL, borrower's message to lender
  status:       String          REQUIRED, enum: ['PENDING','APPROVED','REJECTED','ACTIVE','RETURNED','DISPUTED']
  createdAt:    Date            AUTO
  updatedAt:    Date            AUTO
}
```

**Why these fields:**
- `lenderId` is denormalized (also stored in Listing) — allows "show me all incoming requests" without joining Listing
- `totalCost` and `depositAmount` are SNAPSHOTS — if the lender changes their price later, the original agreed price is preserved
- `status` enum is the state machine core — drives the entire transaction flow

**Status State Machine:**
```
PENDING → APPROVED → ACTIVE → RETURNED
        → REJECTED
ACTIVE  → DISPUTED
```

**Indexes:**
- `borrowerId` — for "my outgoing requests"
- `lenderId` — for "my incoming requests"
- `listingId` — for checking if an item already has an active request
- `status` — for filtering by status

---

## Collection: escrowtransactions

**Purpose:** Tracks the security deposit lifecycle for each approved borrow request.

```
{
  _id:          ObjectId        (auto-generated)
  requestId:    ObjectId        REQUIRED, ref: 'BorrowRequest', unique
  amount:       Number          REQUIRED (deposit amount in INR)
  status:       String          REQUIRED, enum: ['HELD','RELEASED','DISPUTED','REFUNDED']
  heldAt:       Date            when deposit was locked
  releasedAt:   Date            OPTIONAL, when deposit was returned
  notes:        String          OPTIONAL, for dispute resolution notes
  createdAt:    Date            AUTO
  updatedAt:    Date            AUTO
}
```

**Why a separate collection:**
Escrow is a financial concept separate from the borrow request itself. Keeping it separate:
- Makes financial queries simpler
- Allows independent audit trail
- Prepares for real payment gateway integration

**Status State Machine:**
```
HELD → RELEASED (lender confirms safe return)
     → DISPUTED (either party raises issue)
     → REFUNDED (dispute resolved in borrower's favor)
```

**Indexes:**
- `requestId` — unique (one escrow per request)
- `status` — for "show all held escrows"

---

## Entity Relationship Summary

```
User ──< Listing        (one user can have many listings)
User ──< BorrowRequest  (as borrower: one user can make many requests)
User ──< BorrowRequest  (as lender: one user can receive many requests)
Listing ──< BorrowRequest   (one listing can have many requests, but only one ACTIVE)
BorrowRequest ──o EscrowTransaction  (one request has at most one escrow)
```

---

## What is NOT in the database yet (by design)

- Reviews/Ratings model (needs completed transaction flow first)
- Notifications model (deferred; can use polling initially)
- Admin/moderator model (deferred)
- Payment transactions (deferred; Razorpay integration later)
