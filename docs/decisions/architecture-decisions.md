# Architecture Decision Records (ADR)

> Every meaningful technical decision is logged here with full context and reasoning.
> Format: Decision → Context → Options → Chosen → Why → Trade-offs → Interview answer.

---

## ADR-001: Frontend Framework — React + Vite

**Decision:** Use React 19 with Vite 8 as the frontend framework and build tool.

**Context:**
We needed a frontend framework that is fast to develop with, has a large ecosystem, and is industry standard for interview credibility.

**Options considered:**
1. React + Vite
2. Next.js (React SSR/SSG)
3. Vue.js + Vite
4. Plain HTML/JS

**Chosen:** React + Vite

**Why:**
- React is the dominant framework in the job market
- Vite has near-instant HMR and very fast build times
- React Context is sufficient for our state complexity right now
- No need for SSR (SEO is not a priority for a marketplace MVP)

**Trade-offs:**
- No SSR means initial load is client-rendered (SEO impact, but irrelevant for MVP)
- React Context may need to be upgraded to Zustand/Redux if state becomes complex
- Vite dev server is not for production use

**Rejected alternatives:**
- Next.js: Adds SSR complexity we don't need right now
- Vue.js: Smaller ecosystem, less interview value
- Plain HTML: Not scalable, no component model

**Interview answer:**
"I chose React with Vite because React is the industry standard and Vite gives near-instant hot module replacement during development. We don't need SSR because this is an authenticated marketplace, not a public SEO-driven site, so Next.js would add complexity without benefit at this stage."

---

## ADR-002: State Management — React Context

**Decision:** Use React Context (AppContext) for global state management.

**Context:**
The frontend needs to share state across components: listings, user borrows, toast notifications, and escrow balance.

**Options considered:**
1. React Context
2. Zustand
3. Redux Toolkit
4. Jotai/Recoil

**Chosen:** React Context

**Why:**
- The app has simple, flat state (listings array, borrows array, toasts array)
- Context is built into React — no extra dependency
- For the current complexity, Context has zero drawbacks
- Premature optimization to use Redux would add boilerplate without benefit

**Trade-offs:**
- Context re-renders all consumers when any value changes (performance concern at scale)
- No devtools support (Redux has excellent devtools)
- May need to split context into smaller pieces if state grows

**When to upgrade:**
If the state grows to 10+ slices, or if re-render performance becomes measurable, move to Zustand.

**Interview answer:**
"I started with React Context because our state is simple — a few arrays and primitive values. I know Context has re-render limitations at scale, but premature optimization is worse than readable code at MVP stage. If this grew to a production system I would move to Zustand, which gives Redux-like predictability without the boilerplate."

---

## ADR-003: Routing — State-based (will migrate to react-router)

**Decision:** Use a custom state-based routing system (useState for current page).

**Context:**
Initial implementation used setState to switch between pages. This was fast to build and works for the MVP.

**Problem identified:**
When authentication is added, we need protected routes (redirect to login if not authenticated). State-based routing cannot do this cleanly. Also, URLs do not update, so the browser back button does not work.

**Migration plan:**
When auth is implemented, migrate to react-router v7 with:
- Public routes: /home, /marketplace, /listing/:id
- Protected routes: /dashboard, /lend, /borrow/:id
- Auth redirect wrapper component

**Interview answer:**
"I started with state-based routing to move quickly, but I knew from the beginning this would need to change. As soon as we add authentication, we need URL-based routing so protected routes can redirect unauthenticated users, and so the browser back button works correctly. This is a deliberate technical debt I took on with a clear plan to pay it back."

---

## ADR-004: Backend Runtime — Node.js + Express

**Decision:** Use Node.js with Express.js for the backend API server.

**Context:**
We need to build a REST API server. The key requirements are:
- Fast to build
- Well-understood ecosystem
- Good MongoDB library support (Mongoose)
- Good JWT library support
- Interview credibility

**Options considered:**
1. Node.js + Express
2. Node.js + Fastify
3. Python + FastAPI
4. Go + Gin

**Chosen:** Node.js + Express

**Why:**
- Express is the most widely taught and understood Node.js framework
- Largest ecosystem of middleware
- Excellent Mongoose and JWT library support
- Same language as the frontend (JavaScript) — one language across the stack
- Most employers expect Node.js + Express knowledge

**Trade-offs:**
- Express is unopinionated — requires manual structure decisions
- Single-threaded (but Node.js non-blocking I/O handles concurrent requests well)
- Not the fastest option (Fastify is ~2x faster), but performance is irrelevant at our scale

**Rejected alternatives:**
- Fastify: More performant but less familiar and smaller ecosystem
- Python + FastAPI: Would require switching languages; good for ML integration later
- Go + Gin: Excellent performance but steep learning curve, less interview relevance for this type of project

**Interview answer:**
"I chose Node.js with Express because it lets me use JavaScript across the full stack, has the largest ecosystem, and is what most backend engineering roles expect. Express is unopinionated, which means I had to make deliberate architectural decisions rather than following a framework's conventions — that actually teaches you more."

---

## ADR-005: Database — MongoDB + Mongoose

**Decision:** Use MongoDB as the primary database with Mongoose as the ODM.

**Context:**
We need a database that can store users, listings, borrow requests, and escrow transactions.

**Options considered:**
1. MongoDB + Mongoose
2. PostgreSQL + Prisma
3. PostgreSQL + Sequelize
4. SQLite (dev only)

**Chosen:** MongoDB + Mongoose

**Why:**
- Listings have a flexible schema (different categories may have different attributes)
- Mongoose provides schema validation at the application layer
- No complex relational joins needed at MVP stage
- MongoDB Atlas provides free cloud hosting for development
- Mongoose's populate() handles our reference relationships well

**Trade-offs:**
- No ACID transactions by default (MongoDB 4.0+ supports multi-document transactions but they're slower)
- Denormalized data can become inconsistent if not carefully managed
- No enforced referential integrity (a listing can reference a deleted user)
- Not ideal if we later need complex reporting queries

**When PostgreSQL would be better:**
If we add financial transactions (real money), complex reporting, or strict data consistency requirements, PostgreSQL would be the right choice.

**Interview answer:**
"I chose MongoDB because our listing data has a somewhat flexible schema — different item categories might have different attributes — and MongoDB handles document-style data naturally. At our scale, the performance of MongoDB vs PostgreSQL is irrelevant. However, I'm aware of the trade-off: MongoDB doesn't enforce referential integrity or give us true multi-table transactions by default, which matters more as we add financial logic."

---

## ADR-006: Authentication — JWT (Access + Refresh Token)

**Decision:** Use JWT-based authentication with short-lived access tokens and longer-lived refresh tokens.

**Context:**
We need to authenticate users so they can create listings and borrow requests. The authentication system must:
- Be stateless (no server-side session store needed)
- Be secure
- Handle token expiry gracefully

**Options considered:**
1. JWT access token only
2. JWT access + refresh token
3. Session-based authentication (express-session)
4. OAuth only (Google/GitHub login)

**Chosen:** JWT access + refresh token

**Why:**
- Access token: short-lived (15 minutes), used for every API request
- Refresh token: long-lived (7 days), stored in httpOnly cookie, used to get new access tokens
- If access token is stolen, it expires in 15 minutes — limited damage
- Refresh token in httpOnly cookie is not accessible to JavaScript (XSS protection)
- Stateless — no session store needed at this scale

**Trade-offs:**
- JWTs cannot be invalidated before expiry (logout doesn't truly kill the token)
- Refresh token rotation adds implementation complexity
- httpOnly cookie + CORS requires careful configuration

**Why not session-based:**
Sessions require a session store (Redis or DB). At our current scale this adds infrastructure complexity without benefit.

**Interview answer:**
"I use JWT with a dual-token strategy. The access token is short-lived (15 minutes) and sent in the Authorization header. The refresh token is long-lived (7 days) and stored in an httpOnly cookie so JavaScript cannot read it, which protects against XSS attacks. If the access token is stolen, it expires quickly. The main limitation of JWTs is that they can't be invalidated server-side before expiry, which is an acceptable trade-off at our scale."

---

## ADR-007: API Design — REST

**Decision:** Use REST API design with JSON responses.

**Context:**
We need an API that the frontend can consume and that demonstrates professional API design skills.

**Options considered:**
1. REST
2. GraphQL
3. tRPC

**Chosen:** REST

**Why:**
- REST is the industry standard and most widely understood
- Our data model is simple — no need for GraphQL's flexible querying
- REST is cacheable, predictable, and easy to document
- No need for type-safe RPC (tRPC) since frontend and backend are separate

**Trade-offs:**
- REST can over-fetch or under-fetch data compared to GraphQL
- Multiple round trips for related data (e.g., listing + lender info)

**Interview answer:**
"I chose REST because our data model is straightforward and REST is the industry standard. GraphQL would add value if clients need flexible querying of nested data, but our frontend has specific, predictable data requirements, so REST is simpler to implement, document, and debug."
