# CirculateX — Development Changelog

> Records what changed, why, and what was learned at each milestone.

---

## [0.1.0] — Frontend Foundation (September 2026)

**What changed:**
- Initialized React 19 + Vite 8 project with TailwindCSS v4
- Built design system: CSS custom properties, color tokens, typography (Inter + Space Grotesk), animations
- Created AppContext with mock data for 6 listings + 1 active borrow
- Implemented state-based SPA routing (no react-router yet)
- Built all 5 pages: Home, Marketplace, LendPage, BorrowPage, DashboardPage
- Built 3 components: Navbar, ItemModal, ToastContainer
- Form validation on LendPage and BorrowPage (client-side only)
- localStorage persistence for user-created listings

**Why:**
- Starting with frontend-first lets us see the product clearly before designing the API
- Mock data lets us build and test UI without a backend
- localStorage gives a taste of persistence without infrastructure

**What was learned:**
- React Context re-renders all consumers — keep state flat and split contexts when they grow
- State-based routing is fast to build but blocks proper auth flow
- Design tokens (CSS custom properties) make the entire app visually consistent

**Technical debt created:**
- Routing needs migration to react-router when auth is added
- Mock data in AppContext must be replaced by API calls
- Hardcoded user identity ("S" avatar, "Shahadat Hussain") must come from auth context

**Git commits:**
- `dca03a2` first commit
- `63c2133` Homepage
- `a3e1c9d` Main Page
- `ebc7bab` feat: implement core frontend architecture

---

## [0.2.0] — Backend Foundation + Auth (NEXT)

**What will change:**
- Initialize Backend/ as Node.js project
- Express server with security middleware
- MongoDB connection
- User model + auth endpoints
- JWT access + refresh token system

**Why:**
- Everything depends on authentication — it is the unblocking step
- Cannot have real listings or requests without knowing who is performing the action

**Technical decisions to make:**
- bcrypt cost factor (choosing 12)
- JWT expiry times (15min access, 7d refresh)
- Cookie configuration (httpOnly, secure in prod, sameSite)

---

## [0.3.0] — Listings API (PLANNED)

**What will change:**
- Listing model and CRUD endpoints
- Search, filter, sort on GET /api/listings
- Authorization: only listing owner can edit/delete

---

## [0.4.0] — Borrow Request API + Escrow (PLANNED)

**What will change:**
- BorrowRequest model and state machine
- EscrowTransaction model
- Request lifecycle: PENDING → APPROVED → RETURNED
- Authorization checks throughout

---

## [0.5.0] — Frontend Integration (PLANNED)

**What will change:**
- Replace AppContext mock data with real API calls
- Add react-router with protected routes
- Login/Register pages
- Real borrow and lend form submissions
