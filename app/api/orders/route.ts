import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers } from "@/db/schema";

/**
 * POST /api/orders
 * Create order + customer. Called by payment webhook or checkout success.
 * Body: { scanId?, amountCents, bundleYears, dnsHelp, businessName, domain, subdomain?, websiteUrl }
 */
export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  let body: {
    scanId?: string;
    amountCents: number;
    bundleYears: number;
    dnsHelp?: boolean;
    businessName: string;
    domain: string;
    subdomain?: string;
    websiteUrl: string;
    paymentId?: string;
    paymentProvider?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { scanId, amountCents, bundleYears, dnsHelp, businessName, domain, subdomain, websiteUrl, paymentId, paymentProvider } = body;

  if (
    typeof amountCents !== "number" ||
    typeof bundleYears !== "number" ||
    typeof businessName !== "string" ||
    typeof domain !== "string" ||
    typeof websiteUrl !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required fields: amountCents, bundleYears, businessName, domain, websiteUrl" },
      { status: 400 }
    );
  }

  try {
    const [order] = await db
      .insert(orders)
      .values({
        scanId: scanId ?? null,
        amountCents,
        bundleYears,
        dnsHelp: dnsHelp ?? false,
        status: paymentId ? "paid" : "pending",
        paymentProvider: paymentProvider ?? null,
        paymentId: paymentId ?? null,
      })
      .returning();

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const prepaidYears = bundleYears;
    const prepaidUntil = new Date();
    prepaidUntil.setFullYear(prepaidUntil.getFullYear() + prepaidYears);

    const [customer] = await db
      .insert(customers)
      .values({
        orderId: order.id,
        businessName,
        domain,
        subdomain: subdomain ?? "chat",
        websiteUrl,
        prepaidUntil,
        status: "content_collection",
      })
      .returning();

    return NextResponse.json({
      order,
      customer,
    });
  } catch (e) {
    console.error("Order creation error:", e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
