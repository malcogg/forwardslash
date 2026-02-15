import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/dashboard?orderId=xxx
 * Returns order + customer for the dashboard.
 * When auth is added, we'll validate the user owns this order.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { error: "orderId required" },
      { status: 400 }
    );
  }

  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.orderId, orderId));

  return NextResponse.json({
    order,
    customer: customer ?? null,
  });
}
