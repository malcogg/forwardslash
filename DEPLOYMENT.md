## Deployment & Subdomain Automation (Vercel)

### Environments
Maintain distinct envs:
- **Development**: local + Stripe test mode + dev Clerk instance
- **Production**: Vercel + Stripe live mode + prod Clerk instance

---

## Required environment variables (production)

### Core
- `DATABASE_URL` (Neon pooled URL recommended)
- `NEXT_PUBLIC_APP_URL` (e.g. `https://www.forwardslash.chat`)

### Auth (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET` (for `/api/webhooks/clerk`)

### Payments (Stripe)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Crawl + LLM
- `FIRECRAWL_API_KEY` (legacy) or preferred multi-key: `FIRECRAWL_API_KEYS`
- `OPENAI_API_KEY` (legacy) or preferred multi-key: `OPENAI_API_KEYS`

### Email (Resend)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_WEBHOOK_SECRET` (if using inbound webhooks)

### Cron
- `CRON_SECRET` (Bearer token required by `/api/cron/*`)

### Domain automation
- `VERCEL_ACCESS_TOKEN`
- `VERCEL_PROJECT_ID`
- Optional:
  - `CNAME_TARGET` (defaults to `cname.vercel-dns.com`)

---

## Stripe setup
- Create a webhook endpoint in Stripe:
  - `POST https://www.forwardslash.chat/api/webhooks/stripe`
  - Subscribe to: `checkout.session.completed` (and optionally async variants)
- Set the webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

---

## Vercel domain automation flow
1. Customer adds `CNAME chat → cname.vercel-dns.com` (or your configured `CNAME_TARGET`).
2. Backend verifies DNS via Google DoH.
3. Backend calls Vercel Domains API to attach `chat.customer.com` to the project.
4. Vercel provisions SSL automatically.
5. Customer status becomes `delivered`.

Key endpoint:
- `POST /api/customers/[id]/go-live`

---

## Cron endpoints
All cron endpoints require:
- `Authorization: Bearer ${CRON_SECRET}`

Configured in Vercel Cron (recommended):
- `/api/cron/paid-notification` — every 10–15 minutes
- `/api/cron/checkout-reminder` — daily
- `/api/cron/payment-reminder` — daily

---

## Production smoke test checklist
- Create Stripe test payment in staging (or live $1 product in prod, if acceptable).
- Confirm webhook marks order `paid`.
- Trigger crawl; confirm `content` rows created.
- Verify `/chat/c/[customerId]` works.
- Add a test domain + CNAME; verify `/go-live` attaches domain and loads chat on that host.

