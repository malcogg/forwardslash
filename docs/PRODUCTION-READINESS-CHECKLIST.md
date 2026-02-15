# ForwardSlash.Chat - Production Readiness Checklist

Use this as the single source of truth for what's done vs what's needed for real clients. Focus: UI first, then backend. Stay within Vercel ecosystem where possible.

**Email provider:** Resend (Vercel marketplace)

Last updated: February 2026

---

## DONE (Built)

### Landing Page
- [x] Hero with URL input + Scan button
- [x] Sidebar (Chatbot header, Demo + scanned sites, Guest footer)
- [x] Sidebar toggle with tooltip
- [x] Greeting: "Hello there!" + "How can I help you today?"
- [x] 4 pills in 2x2 grid (How it works, Pricing, About, Demo)
- [x] Input box fixed at bottom of page
- [x] Info modals (How it works, Pricing, About, Demo) with blur backdrop

### Scan Flow
- [x] Scan modal: loading → results with page count
- [x] Content category toggles (Products, Blog, etc.)
- [x] Progress bar + "2–8 min" estimate
- [x] Error handling + retry

### Pricing Flow
- [x] Tier auto-selected by page count (Small/Medium/Large/Enterprise)
- [x] DNS upsell checkbox (+$99)
- [x] "Continue to Payment" → redirects to /checkout with params

### Demo
- [x] Demo chat at /chat/demo
- [x] Demo Coffee branding, sample content
- [x] Keyword-based answers (no LLM yet)

### Backend
- [x] Firecrawl API integration (scan → page count + categories)
- [x] FIRECRAWL_API_KEY in env (Vercel + .env.local)
- [x] /api/scan route (saves scan to DB, returns scanId)
- [x] Neon Postgres + Drizzle ORM
- [x] Schema: users, scans, orders, customers, content
- [x] POST /api/orders (create order + customer)
- [x] GET /api/dashboard?orderId= (order + customer)
- [x] /checkout page (collects business info, creates order)

### Dashboard
- [x] Load order/customer from DB when orderId in URL
- [x] Order status, amount, bundle from backend
- [x] Chatbot URL, prepaid until, domain from customer
- [x] DNS instructions section (CNAME block, provider guides)
- [x] Checklist

### Dev / Ops
- [x] Deployed on Vercel (GitHub → Vercel)
- [x] Env docs for Cursor / Vercel / v0 / GitHub

---

## TODO (Needed for Real Clients)

### 1. Authentication
- [ ] Auth provider (Clerk or NextAuth – both on Vercel marketplace)
- [ ] Sign-up required after payment (Google, Apple, email)
- [ ] Protect /dashboard (redirect unauthenticated users)
- [ ] Link payment to user account

### 2. Payments
- [ ] PayPal checkout (primary)
- [ ] Stripe fallback
- [ ] Webhook handlers for payment confirmation
- [ ] Store order: customer, amount, bundle, DNS add-on

### 3. Data Storage
- [x] Database: Neon Postgres (Drizzle ORM)
- [x] Schema: users, scans, orders, customers, content
- [x] Customer config: business name, subdomain, domain, websiteUrl
- [ ] Link auth user to order (userId)

### 4. Post-Payment Flow
- [ ] After payment: redirect to sign-up
- [ ] After sign-up: redirect to /dashboard
- [ ] Create order record in DB

### 5. Dashboard (Real Data)
- [x] Load order/customer from DB
- [x] Order status from backend
- [x] Real chatbot URL (from customer record)
- [ ] Copy buttons for CNAME
- [ ] Upload extra files
- [ ] Request change form

### 6. Emails (Resend)
- [ ] Resend integration (Vercel marketplace)
- [ ] Thank-you email (after payment)
- [ ] Delivery email (chatbot live)
- [ ] DNS instructions email (if self-setup)

### 7. Chat (Customer-Facing – Exact Product)
**Build this as the exact product customers get.** Can be done after core flow works.

- [ ] Multi-tenant routing (hostname → customerId)
- [ ] Chat API: load content by customerId, call LLM
- [ ] Chat UI: same as /chat/demo but dynamic (branding, content)
- [ ] Vercel AI SDK (useChat, streamText)
- [ ] Content storage per customer (from scan + optional uploads)

### 8. Admin / Fulfillment
- [ ] Admin route (e.g. /admin) – protected
- [ ] Manual customer creation form
- [ ] Trigger crawl + save content
- [ ] Mark order as delivered

### 9. DNS & Domains
- [ ] cname.forwardslash.chat configured (or Vercel target)
- [ ] Add customer domains in Vercel when DNS ready
- [ ] Test CNAME flow

### 10. Internal
- [ ] Order tracking (Notion/Airtable/sheet)
- [ ] Dev workflow doc reviewed

---

## Build Order (Recommended)

| Phase | Focus | Key deliverables |
|-------|--------|-------------------|
| **1. Auth + Payments** | Get money, get user | Clerk/NextAuth, Stripe/PayPal, webhooks, order storage |
| **2. Data + Dashboard** | Real data | DB schema, dashboard with real order data |
| **3. Emails** | Communication | Resend, thank-you + delivery templates |
| **4. Chat** | Core product | Multi-tenant chat, LLM, content retrieval |
| **5. Fulfillment** | Ops | Admin tool, manual fulfillment flow |

---

## Vercel Marketplace (Stay Within)

Use for:
- **Auth:** Clerk, NextAuth
- **Database:** Neon, Vercel Postgres, Upstash
- **Email:** Resend
- **Blob:** Vercel Blob (for file uploads)

---

## /chat Page – Design Principle

The /chat page (for real customers at chat.theirdomain.com) must match the demo experience: same UI, same flow. Build /chat/demo as the reference implementation. When building the real chat:
- Reuse the same components
- Swap hardcoded content for DB content
- Apply customer branding (colors, logo, welcome message)

---

## Reference Docs

- `FIRST-ORDER-READINESS.md` – Pre-launch checklist
- `MVP-PRD.md` – Product requirements
- `customer-dashboard-mvp.md` – Dashboard spec
- `DEV-WORKFLOW-MANUAL-FULFILLMENT.md` – Fulfillment SOP
- `dns-instructions-reference.md` – CNAME instructions
