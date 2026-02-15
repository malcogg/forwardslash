# ForwardSlash.Chat - Backend Setup

Database and API setup guide. **Never commit database credentials** to the repo.

## Database (Neon Postgres + Drizzle)

### 1. Environment variables

Create `.env.local` in the project root with:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Get your connection string from [Neon Console](https://console.neon.tech). Use the **pooled** URL for serverless (Vercel).

**Vercel:** Add `DATABASE_URL` (or `POSTGRES_URL`) in Project → Settings → Environment Variables.

### 2. Push schema to database

After installing deps (`npm install`), run:

```bash
npm run db:push
```

This creates/updates tables from `db/schema.ts`.

### 3. Schema overview

- **users** – Auth (Clerk/NextAuth will sync)
- **scans** – Scan results (url, pageCount, categories)
- **orders** – Payments (amount, bundle, status)
- **customers** – Per-order chatbot config (businessName, domain, subdomain)
- **content** – Crawled pages per customer (for chat retrieval)

### 4. Drizzle commands

- `npm run db:push` – Sync schema to DB (dev)
- `npm run db:generate` – Generate migration files
- `npm run db:migrate` – Run migrations
- `npm run db:studio` – Open Drizzle Studio (requires `DATABASE_URL`)

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/scan` | POST | Scan URL via Firecrawl, save to DB, return pageCount + scanId |
| `/api/orders` | POST | Create order + customer |
| `/api/orders/[id]` | GET | Get order by ID |
| `/api/customers/by-order/[orderId]` | GET | Get customer for order |
| `/api/dashboard?orderId=` | GET | Order + customer for dashboard |

## Flow

1. **Scan** – User enters URL → `/api/scan` → saves to `scans`, returns scanId
2. **Checkout** – User fills form at `/checkout` → POST `/api/orders` → creates order + customer
3. **Dashboard** – `/dashboard?orderId=xxx` → GET `/api/dashboard` → shows real data

Payment webhooks (PayPal/Stripe) will call POST `/api/orders` with `paymentId` and `paymentProvider` when ready.
