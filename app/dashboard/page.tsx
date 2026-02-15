"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Payment confirmed",
  processing: "Processing",
  delivered: "Delivered",
  failed: "Failed",
  content_collection: "Content collection",
  crawling: "Crawling website",
  indexing: "Indexing content",
  dns_setup: "DNS setup",
  testing: "Testing",
};

const CHECKLIST = [
  "Payment confirmed",
  "Website scanned",
  "Content selected",
  "Bot trained",
  "DNS configured",
  "Chatbot live",
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [data, setData] = useState<{
    order: { id: string; status: string; amountCents: number; bundleYears: number; dnsHelp: boolean };
    customer: {
      businessName: string;
      domain: string;
      subdomain: string;
      websiteUrl: string;
      prepaidUntil: string | null;
      status: string;
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/dashboard?orderId=${encodeURIComponent(orderId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Could not load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-background">
        <div className="max-w-3xl mx-auto flex items-center justify-center py-16 text-muted-foreground">
          Loading...
        </div>
      </main>
    );
  }

  if (error || (orderId && !data)) {
    return (
      <main className="min-h-screen p-8 bg-background">
        <div className="max-w-3xl mx-auto text-center py-16">
          <p className="text-muted-foreground mb-4">{error ?? "Order not found"}</p>
          <Link href="/" className="text-primary hover:underline">Back to home</Link>
        </div>
      </main>
    );
  }

  const order = data?.order;
  const customer = data?.customer;
  const hasOrder = !!order;
  const prepaidUntil = customer?.prepaidUntil ? new Date(customer.prepaidUntil) : null;
  const chatUrl = customer
    ? `https://${customer.subdomain}.${customer.domain}`
    : "chat.yourbusiness.com";

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">Dashboard</h1>

        {!orderId && (
          <p className="text-muted-foreground mb-6">
            Complete a checkout to see your order here, or{" "}
            <Link href="/checkout" className="text-primary hover:underline">go to checkout</Link>.
          </p>
        )}

        {/* Order Status */}
        <section className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Status</h2>
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                order?.status === "paid" || order?.status === "delivered"
                  ? "bg-green-500"
                  : "bg-amber-500"
              }`}
            />
            <span className="text-foreground">
              {hasOrder ? STATUS_LABELS[order.status] ?? order.status : "Payment confirmed"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Estimated delivery: 3–10 business days
          </p>
          {hasOrder && (
            <p className="text-xs text-muted-foreground mt-2">
              ${(order.amountCents / 100).toLocaleString()} • {order.bundleYears}-year bundle
              {order.dnsHelp ? " • DNS help included" : ""}
            </p>
          )}
        </section>

        {/* Chatbot Details */}
        <section className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Chatbot</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground">Business:</span> {customer?.businessName ?? "—"}
            </li>
            <li>
              <span className="text-foreground">URL:</span> {chatUrl}
            </li>
            <li>
              <span className="text-foreground">Website:</span>{" "}
              {customer?.websiteUrl ?? "—"}
            </li>
            <li>
              <span className="text-foreground">Prepaid until:</span>{" "}
              {prepaidUntil?.toLocaleDateString() ?? "—"}
            </li>
          </ul>
        </section>

        {/* DNS Instructions */}
        <section className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">DNS Setup</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Add this CNAME record to your DNS:
          </p>
          <pre className="bg-muted p-4 rounded-lg text-sm text-foreground overflow-x-auto">
            {`Type: CNAME
Host/Name: ${customer?.subdomain ?? "chat"}
Value/Points to: cname.forwardslash.chat
TTL: Auto`}
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            Guides:{" "}
            <a href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-cname-record/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cloudflare</a>
            {" · "}
            <a href="https://www.godaddy.com/help/add-a-cname-record-19236" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GoDaddy</a>
            {" · "}
            <a href="https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Namecheap</a>
          </p>
        </section>

        {/* Checklist */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Checklist</h2>
          <ul className="space-y-2">
            {CHECKLIST.map((item, i) => {
              const done = hasOrder && i < 2;
              return (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className={done ? "text-green-500" : "text-muted-foreground/60"}>
                    {done ? "✓" : "○"}
                  </span>
                  {item}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen p-8 bg-background flex items-center justify-center text-muted-foreground">
          Loading...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
