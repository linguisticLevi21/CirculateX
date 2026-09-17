# CirculateX

> **"Transfer Product, Not Ownership"**
> A peer-to-peer item lending and borrowing marketplace for the circular economy.

---

## Problem

People own expensive items they rarely use — cameras, power tools, gaming consoles, instruments.
Others need these items temporarily but cannot justify buying them.
Existing peer-to-peer marketplaces are buy/sell only. Trust is the missing ingredient for short-term lending.

## Solution

CirculateX enables anyone to **lend what they own** and **borrow what they need**.
Trust is enforced through a mandatory **security deposit held in escrow** — automatically released on safe return.

## Key Features

- Browse marketplace of items available to borrow
- List your own items with daily rental price and security deposit
- Send borrow requests with custom date ranges
- Lender approves/rejects requests
- Security deposit held in escrow during borrow period
- Dashboard: track your listings, borrows, and escrow balance

## Tech Stack

| Layer    | Technology                             | Why                                     |
| -------- | -------------------------------------- | --------------------------------------- |
| Frontend | React 19 + Vite 8                      | Fast dev, industry standard             |
| Styling  | TailwindCSS v4 + CSS custom properties | Design system with tokens               |
| State    | React Context                          | Right size for current complexity       |
| Backend  | Node.js + Express.js                   | Ecosystem, JS full-stack, familiar      |
| Database | MongoDB + Mongoose                     | Flexible listing schema, document model |
| Auth     | JWT (access + refresh token)           | Stateless, scalable                     |
| Security | bcrypt, helmet, CORS, httpOnly cookies | See security docs                       |

## Architecture

```
React Frontend  ←→  Express REST API  ←→  MongoDB
(Vite dev server)   (Node.js)             (Atlas / local)
```

See [Architecture Documentation](./docs/architecture/high-level-architecture.md) for full diagrams.

## Database Design

Four collections: `users`, `listings`, `borrowrequests`, `escrowtransactions`.

See [Schema Documentation](./docs/database/schema.md) for full schema with reasoning.

## API Overview

All API routes are under `/api/`. See [API Reference](./docs/api/api-reference.md) for full documentation.

**Core flows:**

- `POST /api/auth/register` + `POST /api/auth/login`
- `GET /api/listings` + `POST /api/listings`
- `POST /api/requests` + `PATCH /api/requests/:id/approve`
- `POST /api/escrow/release`

## Project Status

| Layer                    | Status               |
| ------------------------ | -------------------- |
| Frontend UI              | Complete (mock data) |
| Backend server           | In progress          |
| Authentication           | In progress          |
| Listings API             | In progress          |
| Borrow Requests API      | Planned              |
| Escrow system            | Planned              |
| Frontend-API integration | Planned              |
| AI features              | Future               |

See [Progress Document](./docs/development/progress.md) for full status.

## Key Engineering Decisions

- **MongoDB over PostgreSQL**: flexible listing schema, document model matches API responses
- **JWT dual-token**: short access token + httpOnly refresh token for security
- **State machine for escrow**: prevents invalid transitions and double-releases
- **Monolith over microservices**: current scale does not justify distributed complexity

See [Architecture Decisions](./docs/decisions/architecture-decisions.md) for full reasoning.

## How to Run Locally

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Runs on http://localhost:5173

### Backend (once implemented)

```bash
cd Backend
npm install
cp .env.example .env  # fill in your values
npm run dev
```

Runs on http://localhost:5000

## Environment Variables (Backend)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/circulatex
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Documentation

- [Progress & Status](./docs/development/progress.md)
- [Architecture](./docs/architecture/high-level-architecture.md)
- [Database Schema](./docs/database/schema.md)
- [API Reference](./docs/api/api-reference.md)
- [Architecture Decisions](./docs/decisions/architecture-decisions.md)
- [Learning Log](./docs/learning/learning-log.md)

---

_Built by Shahadat Hussain as a full-stack learning project demonstrating backend engineering, system design, API design, authentication, and scalability thinking._
