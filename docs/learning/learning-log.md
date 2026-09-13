# CirculateX — Learning Log

> This file records every important concept introduced during the project.
> Format: Concept → What it is → How it works → Our usage → Interview answer.

---

## CONCEPT-001: JWT (JSON Web Token)

### Intuition
Imagine a concert wristband. Once the security guard stamps your wrist (verifies you paid), you can enter any area without being checked again by every staff member. The wristband itself proves you are authorized. JWT works the same way — the server gives you a token after login, and you show it to every protected API.

### How it actually works
A JWT is three Base64-encoded parts separated by dots:
```
Header.Payload.Signature
```
- **Header**: algorithm used (HS256)
- **Payload**: claims (userId, email, expiry time `exp`, issued at `iat`)
- **Signature**: `HMAC-SHA256(header + "." + payload, SECRET_KEY)`

The server verifies the signature by re-computing it. If it matches, the token is valid. No database lookup needed.

### Our usage in CirculateX
- Access token: expires in 15 minutes, sent in Authorization header (`Bearer <token>`)
- Refresh token: expires in 7 days, sent as httpOnly cookie

### Alternatives considered
- Session tokens: require a session store (Redis/DB) — adds infrastructure
- OAuth (Google login): adds complexity; we want email/password auth for learning

### Trade-offs
- Pro: Stateless — no DB hit to verify token
- Con: Cannot be invalidated before expiry (logout doesn't "kill" the token server-side)
- Our mitigation: Short access token TTL (15 min) + store refresh token hash to invalidate on logout

### Interview answer
"JWT is a self-contained token. The server signs it with a secret key. Every subsequent request includes this token. The server verifies the signature — no DB lookup needed, which makes it stateless and scalable. The trade-off is that JWTs can't be invalidated early, which is why I use a short 15-minute access token TTL."

---

## CONCEPT-002: bcrypt Password Hashing

### Intuition
If someone breaks into our database, we don't want them to read everyone's passwords. Instead of storing "password123", we store a scrambled version that cannot be reversed.

### How it works
bcrypt is a one-way hashing function that:
1. Generates a random "salt" (prevents rainbow table attacks)
2. Hashes the password + salt together
3. Runs the hash thousands of times (cost factor) to make brute force slow

A hash looks like: `$2b$12$...` where `12` is the cost factor.

To verify: hash the input password with the stored salt and compare to the stored hash.

### Our usage
- Cost factor: 12 (2^12 = 4096 iterations per hash)
- At cost 12, hashing takes ~300ms on a modern CPU — fast enough for a user but very slow for a brute-force attacker trying millions of passwords

### Why not SHA256?
SHA256 is designed to be fast. Fast is bad for passwords because attackers can try billions of guesses per second. bcrypt is intentionally slow.

### Interview answer
"I use bcrypt with a cost factor of 12. bcrypt adds a random salt so two identical passwords produce different hashes, which defeats rainbow table attacks. The cost factor makes each hash deliberately slow (~300ms), which makes brute force attacks computationally infeasible."

---

## CONCEPT-003: Mongoose Schema vs MongoDB Schema-less

### Intuition
MongoDB itself doesn't care what shape your documents are — you can put anything in any collection. Mongoose adds a layer on top that enforces a schema at the application level.

### Why we use Mongoose schemas
- Validation before data reaches the database
- Auto-completion and type safety in IDE
- Virtual fields and instance methods
- populate() for joining references

### The trade-off
Mongoose schemas are application-level, not database-level. If someone bypasses Mongoose and writes directly to MongoDB, they could insert invalid data. This is acceptable for our project.

### Interview answer
"MongoDB is schema-less by nature, but Mongoose lets us define schemas in JavaScript. This gives us application-level validation, not database-level constraints. It's a pragmatic trade-off — we get rapid development with good validation, while retaining MongoDB's flexibility to evolve the schema easily."

---

## CONCEPT-004: REST API Design Principles

### What makes an API "RESTful"
1. **Resources** are nouns, not verbs: `/api/listings` not `/api/getListings`
2. **HTTP verbs** express the action: GET (read), POST (create), PATCH (partial update), DELETE (remove)
3. **Stateless**: Each request contains all information needed; server has no session
4. **Consistent responses**: Same envelope format for all responses
5. **Meaningful HTTP status codes**: 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict

### Our API conventions
- All routes under `/api/`
- Nouns in plural: `/listings`, `/requests`, `/users`
- Nested action routes: `/requests/:id/approve`
- Consistent JSON envelope: `{ success, data, message }`

### Interview answer
"I designed the API following REST principles: resources are nouns (listings, requests), HTTP verbs express intent, every response has the same JSON envelope with a success boolean, and HTTP status codes are semantically correct — 401 for unauthenticated, 403 for unauthorized, 404 for not found, 409 for conflicts like duplicate email."

---

## CONCEPT-005: The Escrow State Machine

### What is a state machine?
A state machine is a system that can only be in one state at a time, and transitions between states are controlled by defined events.

### Why escrow needs a state machine
The borrow deposit can be in exactly one state at any time. If we just use a boolean, we lose information. If we allow arbitrary state transitions, we create security bugs.

### Our escrow states
```
BorrowRequest states:
PENDING → (lender approves) → APPROVED → (borrow period starts) → ACTIVE → (safe return) → RETURNED
PENDING → (lender rejects) → REJECTED
ACTIVE → (dispute raised) → DISPUTED

EscrowTransaction states:
[when request APPROVED] → HELD
HELD → (lender confirms return) → RELEASED
HELD → (dispute raised) → DISPUTED
DISPUTED → (resolved) → RELEASED or REFUNDED
```

### Why this matters for security
We check state before allowing transitions:
- Cannot approve an already-approved request
- Cannot release escrow that is not HELD
- Cannot reject an already-active request

Without these checks, a bad actor could double-approve or double-release.

### Interview answer
"The escrow system uses a state machine. The deposit can only move through defined transitions: PENDING to APPROVED (which triggers HELD escrow), ACTIVE to RETURNED (which releases escrow). Each transition checks the current state first. This prevents race conditions where someone tries to double-approve or release escrow before the item is returned."

---

## CONCEPT-006: Middleware Pattern in Express

### Intuition
Middleware is like an airport security line. Every passenger (HTTP request) must pass through each checkpoint (middleware) before reaching their destination (route handler). Each checkpoint can:
- Let the request pass (call `next()`)
- Reject it (send a response and stop)
- Add data to it (e.g., attach the user object)

### Express middleware signature
```js
function myMiddleware(req, res, next) {
  // do something with req
  // optionally modify req (e.g., req.user = decodedToken)
  next(); // pass control to next middleware
}
```

### Our middleware stack (in order)
1. `helmet` — sets secure HTTP headers
2. `cors` — allows frontend origin to make requests
3. `express.json()` — parses JSON body
4. `morgan` — logs every request
5. `auth` (on protected routes) — verifies JWT, attaches req.user
6. Route handlers
7. `errorHandler` (at the end) — catches all unhandled errors

### Interview answer
"Express middleware functions execute in sequence for every request. I use helmet for security headers, cors for cross-origin requests, morgan for request logging, and a custom auth middleware that verifies the JWT and attaches the decoded user to req.user. At the end of the chain, a global error handler catches any unhandled errors and formats them consistently."

---

## CONCEPT-007: Authorization vs Authentication

### Authentication (AuthN)
"Who are you?" — Verifying identity.
Example: Checking your username and password.

### Authorization (AuthZ)
"Are you allowed to do this?" — Verifying permissions.
Example: Checking that you can only edit YOUR OWN listing, not someone else's.

### Our implementation
- **AuthN**: JWT middleware verifies the token → attaches `req.user`
- **AuthZ**: Route handlers check ownership:
  ```js
  if (listing.lenderId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not your listing" });
  }
  ```

### Why 403 not 401?
- 401 = I don't know who you are (not authenticated)
- 403 = I know who you are, but you're not allowed (not authorized)

### Interview answer
"Authentication answers 'who are you' — verified via JWT. Authorization answers 'are you allowed' — checked in each route handler by comparing the requesting user's ID against the resource owner's ID. I return 401 for authentication failures and 403 for authorization failures, which is semantically correct and helps the frontend handle the two cases differently."
