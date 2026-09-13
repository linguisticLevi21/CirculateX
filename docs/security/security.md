# CirculateX — Security Architecture

> For every security mechanism: what attack does it protect against?

---

## 1. Password Storage — bcrypt

**Attack it prevents:** Database breach + password theft.

**Implementation:**
- Never store plain-text passwords
- Hash with bcrypt, cost factor 12 (2^12 = 4096 rounds)
- bcrypt auto-generates a random salt per password
- At cost 12: ~300ms per hash (slow for attacker, acceptable for user)

**Why not MD5 or SHA256?**
They are designed to be fast. Fast is dangerous for passwords. An attacker with a GPU can try 10 billion SHA256 hashes per second. With bcrypt cost 12, they can try only ~10,000 per second per GPU.

**Code pattern:**
```js
const hash = await bcrypt.hash(plainPassword, 12);
const isMatch = await bcrypt.compare(plainPassword, storedHash);
```

---

## 2. JWT Access Token (Short-Lived)

**Attack it prevents:** Token theft window.

**Implementation:**
- Access token expires in 15 minutes
- Signed with HS256 and a secret key (32+ random bytes)
- Sent in JSON response, client stores in memory (not localStorage)

**Why not store JWT in localStorage?**
localStorage is accessible by any JavaScript on the page. If there's an XSS vulnerability, an attacker can read localStorage and steal the JWT. Keeping the access token in memory only means it's gone when the tab closes.

**Why 15 minutes?**
If the token is stolen (e.g., man-in-the-middle), it's only valid for 15 minutes. The damage window is limited.

---

## 3. Refresh Token in httpOnly Cookie

**Attack it prevents:** XSS token theft.

**Implementation:**
- Refresh token (7-day validity) set as httpOnly cookie
- httpOnly: JavaScript cannot read this cookie
- secure: true in production (HTTPS only)
- sameSite: 'strict' (CSRF protection)

**Why httpOnly?**
Even if an attacker injects JavaScript (XSS), they cannot read the refresh token because httpOnly cookies are invisible to JavaScript.

**Why sameSite: strict?**
CSRF attacks trick a user's browser into making authenticated requests to your API. With sameSite=strict, cookies are not sent with cross-site requests.

---

## 4. Authorization Checks

**Attack it prevents:** Broken Access Control (OWASP #1).

**Implementation:**
Every write operation checks that the requesting user owns the resource:
```js
if (listing.lenderId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ error: "Not your listing" });
}
```

**Why this matters:**
Without this check, any authenticated user could edit or delete any listing by guessing or knowing another user's listing ID.

**Pattern:** AuthN verifies who you are. AuthZ verifies what you're allowed to do. Both are required.

---

## 5. Security Headers — helmet

**Attack it prevents:** Various browser-level attacks.

**What helmet does:**
- `X-Frame-Options: DENY` — prevents clickjacking (attacker embedding your page in an iframe)
- `X-Content-Type-Options: nosniff` — prevents MIME type sniffing attacks
- `Content-Security-Policy` — restricts what scripts can run (XSS mitigation)
- Removes `X-Powered-By: Express` (hides server info from attackers)

**Usage:**
```js
app.use(helmet());
```

---

## 6. CORS Configuration

**Attack it prevents:** Unauthorized cross-origin requests.

**Implementation:**
```js
app.use(cors({
  origin: process.env.CLIENT_URL,  // e.g., http://localhost:5173
  credentials: true                 // allow cookies
}));
```

**Why not `origin: '*'`?**
Wildcard CORS allows any website to make requests to your API on behalf of a user. This undermines security. We only allow our own frontend.

---

## 7. Input Validation

**Attack it prevents:** Injection attacks, unexpected data, server crashes.

**Implementation:**
Every route that accepts a request body validates it with express-validator before the controller runs.

```js
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 }),
body('pricePerDay').isFloat({ min: 1 })
```

**Why server-side validation even if the frontend validates?**
The frontend can be bypassed. Any attacker can send requests directly to the API using Postman or curl. Server-side validation is mandatory; client-side is a UX improvement only.

---

## 8. Error Messages — Avoid Information Leakage

**Attack it prevents:** User enumeration.

**Bad pattern:**
```
POST /login → "Email not found"  ← tells attacker which emails exist
POST /login → "Wrong password"   ← tells attacker the email is valid
```

**Good pattern:**
```
POST /login → "Invalid email or password"  ← same message regardless
```

**Implementation:** Use the same error message for both invalid email and invalid password.

---

## 9. Environment Variables — No Hardcoded Secrets

**Attack it prevents:** Credential exposure in source code.

**Rules:**
- JWT secrets in .env only
- MongoDB URI in .env only
- .env is gitignored — never committed
- .env.example is committed as a template with no real values

**Secret generation:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Items Deferred (Post-MVP)

| Item | Reason Deferred |
|---|---|
| Rate limiting | Add after auth is working (use express-rate-limit) |
| Email verification | Requires email service setup |
| 2FA | Post-MVP |
| SQL injection | Not applicable (MongoDB, but validate all inputs) |
| File upload security | No file uploads yet |
| AI prompt injection | Will address when AI features are added |
