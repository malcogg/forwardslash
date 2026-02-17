import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { PaymentReminderEmail } from "@/components/emails/payment-reminder";

const REMINDER_DAYS = 2;

/**
 * GET /api/cron/payment-reminder
 * Vercel Cron: runs daily. Sends payment reminder to users who signed up
 * 2+ days ago and have no paid order.
 *
 * Secured by CRON_SECRET. Add to Vercel env vars.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  if (!resend) {
    return NextResponse.json(
      { error: "Resend not configured" },
      { status: 503 }
    );
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - REMINDER_DAYS);

  try {
    // Users created 2+ days ago with no paid order
    const result = await db.execute<{ id: string; email: string; name: string | null }>(
      sql`
        SELECT id, email, name
        FROM users
        WHERE created_at < ${twoDaysAgo}
        AND NOT EXISTS (
          SELECT 1 FROM orders
          WHERE orders.user_id = users.id AND orders.status = 'paid'
        )
      `
    );

    const rows = result.rows ?? result;
    const toRemind = Array.isArray(rows) ? rows : [];

    let sent = 0;
    for (const user of toRemind) {
      const email = user.email;
      if (!email) continue;

      const firstName = user.name?.split(" ")[0] ?? undefined;

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: "Still want your AI chatbot?",
        react: PaymentReminderEmail({ firstName }),
      });

      if (error) {
        console.error("Payment reminder failed for", email, error);
        continue;
      }
      sent++;
    }

    return NextResponse.json({
      ok: true,
      eligible: toRemind.length,
      sent,
    });
  } catch (e) {
    console.error("Payment reminder cron error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 }
    );
  }
}
