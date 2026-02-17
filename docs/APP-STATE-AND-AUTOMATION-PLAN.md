# ForwardSlash.Chat – Full Breakdown & Automation Plan

## How the App Works

### Architecture

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js 15, React 19, Tailwind | Landing, dashboard, checkout, chat |
| Auth | Clerk | Sign up, sign in (Google, email) |
| DB | Neon Postgres, Drizzle ORM | users, orders, customers, content, scans, credit_usage |
| Scraping | Firecrawl API | Crawl customer websites → markdown |
| Chat / AI | OpenAI (gpt-4o-mini), AI SDK | RAG-style chat using crawled content |
| Email | Resend | Welcome, payment reminder, order confirmation |
| Hosting | Vercel | Landing app + customer chatbots |

### Data Flow

```
Landing (URL) → Sign up (Clerk) → Dashboard → Pay (PayPal) → Crawl (Firecrawl)
     → Content saved to DB → Chat uses content for RAG
```

---

## What’s Automated vs Manual

### Automated

| Step | What Happens |
|------|---------------|
| Signup | Clerk handles auth; webhook sends welcome email |
| Project creation | Pending URL → `POST /api/scan-request` creates order + customer |
| Payment reminder | Vercel cron runs daily; sends to users who signed up 2+ days ago with no paid order |
| Crawl | User pays → clicks "Build my chatbot" → `POST /api/customers/[id]/crawl` runs Firecrawl, saves to `content` |
| Chat | `/chat/c/[customerId]` and `/api/chat` use content for RAG; streaming works today |

### Manual

| Step | Who Does It | Why |
|------|-------------|-----|
| Mark order paid | You (admin) | PayPal has no webhook yet; you update `orders.status = 'paid'` |
| DNS setup | Customer (or you for +$99) | Customer adds CNAME; you verify and add domain in Vercel |
| Deploy chatbot | You | No automated deploy; you add domain in Vercel for `chat.customer.com` |
| Go-live | You | You manually wire content → live URL and tell the customer |

---

## What Needs to Be Done (Current Gaps)

1. **Order status from PayPal** – Webhook or manual flow to set `orders.status = 'paid'`
2. **DNS verification** – Automated check that CNAME points to `cname.forwardslash.chat`
3. **Domain → customer mapping** – Table/config so `chat.business.com` resolves to the right customer
4. **“Go live” flow** – User trigger that connects their domain to their chatbot in our app
5. **Credit migration** – Ensure `credit_usage` table exists in Neon (SQL already documented)

---

## DNS Verification (How Other Apps Do It)

### Pattern (Vercel, Netlify, Cloudflare)

1. User enters `chat.business.com` (or chooses subdomain)
2. App shows: “Add this CNAME: `chat` → `cname.forwardslash.chat`”
3. User adds CNAME in their DNS (Cloudflare, Namecheap, etc.)
4. User clicks **Verify DNS**
5. Backend does a DNS lookup (e.g. `dig` or DNS-over-HTTPS API)
6. If CNAME matches → mark “Verified”, enable go-live

### What We Need

| Component | Description |
|-----------|-------------|
| DNS lookup API | Server-side check that `chat.business.com` CNAME points to our target |
| `POST /api/dns/verify` | Input: `domain`, `subdomain`; output: `verified: boolean` |
| Dashboard UI | “Verify DNS” button; shows success/error |
| DB | `customers.dns_verified_at` (or similar) to remember verification |

### Implementation Options

**A) Node `dns.promises.resolve()`**
- Built-in; works in Node runtime
- May be blocked or limited in serverless/Vercel

**B) DNS-over-HTTPS (DoH)**
- Google: `https://dns.google/resolve?name=chat.business.com&type=CNAME`
- Cloudflare: `https://cloudflare-dns.com/dns-query?name=chat.business.com&type=CNAME`
- Works well in serverless

**C) External API**
- e.g. DNSimple, NS1, etc. (usually paid)

**Suggested:** Use DoH (Google or Cloudflare); no extra keys for basic CNAME checks.

---

## Forking the Vercel AI Chatbot vs Multi-Tenant

### Option A: Multi-Tenant (Recommended)

We already have:
- `/chat/c/[customerId]` serving chat
- `/api/chat` using `content` for RAG

To support custom domains:
1. Add `chat.business.com` to our Vercel project
2. Middleware: map `hostname` → `customerId` (via `domain` → `customer` lookup)
3. Chat stays on our app; only routing changes

**Pros:** No forks, one codebase, simpler  
**Cons:** All chatbots share one Next.js app

### Option B: Per-Customer Fork (Vercel AI Chatbot Template)

Fork [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot) for each customer.

**Steps:**
1. GitHub API: create repo from `vercel/ai-chatbot` template
2. Replace/environmentalize content with this customer’s crawled data
3. Vercel API: create project, link repo, set env vars
4. Vercel API: add domain `chat.business.com`
5. Deploy

**Pros:** Isolated per customer  
**Cons:** More moving parts; template uses its own Neon/Blob/Auth; needs non-trivial customization for RAG from our `content` table

---

## Full Automation Roadmap

### Phase 1: DNS Verification (No Fork)

1. Add `POST /api/dns/verify` (DoH CNAME check)
2. Add `dns_verified_at` to `customers`
3. Dashboard: “Verify DNS” button and status
4. Domain config table: `customer_domains` with `domain`, `customer_id`, `verified_at`

### Phase 2: Custom Domain Routing (Multi-Tenant)

1. Add `chat.business.com`-style domains in Vercel
2. Middleware: resolve hostname → `customerId` from DB
3. “Go live” button that:
   - Requires `dns_verified_at`
   - Adds domain in Vercel (Vercel API)
   - Links domain → customer in our DB

### Phase 3: PayPal Webhook (Optional)

1. PayPal IPN or webhooks
2. On payment confirmation → set `orders.status = 'paid'`
3. Optionally trigger order-confirmation email

### Phase 4: Per-Customer Fork (Only If Needed)

1. GitHub API: create repo from template
2. Script: inject customer config and content
3. Vercel API: create project, env vars, domain
4. Background job or queue for deploy

---

## If We Do Multi-Tenant + DNS + “Go Live”

We do **not** need to fork the Vercel AI Chatbot. What we need:

| Task | Details |
|------|---------|
| DNS verification | DoH API or `dns.promises` to verify CNAME |
| Domain → customer | Table + lookup in middleware |
| Vercel domain | Vercel API to add `chat.business.com` to our project |
| “Go live” button | Checks DNS + content; calls Vercel API; updates customer status |
| Middleware | `chat.business.com` → load customer by domain → render `/chat/c/[customerId]` |

Chat already works; the work is DNS, domain mapping, and Vercel domain setup.

---

## Suggested Improvements (Existing System)

| Area | Suggestion |
|------|-------------|
| Order status | Add PayPal webhook or simple admin “Mark paid” action |
| Long crawls | Firecrawl webhook or async job for 5–30 min sites |
| Checkout data | Save business name, domain, URL to DB before payment |
| Payment reminder | Track `payment_reminder_sent_at` to avoid repeat sends |
| Dashboard | Status timeline, “Verify DNS” step, “Go live” step |
| Errors | Toast / inline errors for crawl, verify, go-live |
| Credits | Run migration if `credit_usage` is missing |

---

## What We Need for DNS Verification (Concrete)

```
1. API route: POST /api/dns/verify
   - Body: { domain, subdomain }  (e.g. business.com, chat)
   - Resolves: chat.business.com via DNS-over-HTTPS
   - Checks: CNAME points to cname.forwardslash.chat
   - Returns: { verified: true } or { verified: false, reason }

2. DB: customers.dns_verified_at (timestamp, nullable)

3. Dashboard: "Verify DNS" button in Domains panel
```

---

## What We Need for "Go Live" (Concrete)

```
1. Vercel API
   - VERCEL_ACCESS_TOKEN in env
   - Add domain to project via Vercel REST API

2. Domain → customer mapping (middleware)
   - Request host chat.business.com → lookup customer → render /chat/c/[id]

3. "Go live" button
   - Requires: content crawled + DNS verified
   - On click: Vercel API add domain, set status = delivered
```

---

## Summary

- **Current:** Signup, welcome, payment reminder, crawl, and chat are automated. Payment marking, DNS, and going live are manual.
- **DNS automation:** Add DoH-based CNAME verification and a “Verify DNS” flow.
- **Go-live automation:** Add domain mapping and Vercel API calls; no fork required if we stay multi-tenant.
- **Fork approach:** Only needed if you want fully separate apps per customer; more complex than extending our existing app.
