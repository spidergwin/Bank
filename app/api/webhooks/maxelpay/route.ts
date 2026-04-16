import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-maxelpay-signature");
    const webhookSecret = process.env.MAXELPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("MAXELPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid MaxelPay signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { event, data } = body;

    if (event === "payment.completed") {
      const { sessionId, orderId, amount } = data;

      // Find the pending transaction
      // We stored the sessionId in the description during creation
      const transaction = await db.transaction.findFirst({
        where: {
          description: {
            contains: sessionId,
          },
          type: "deposit",
        },
      });

      if (!transaction) {
        console.error("Transaction not found for sessionId:", sessionId);
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      // If already processed, ignore
      if (transaction.description?.includes("Completed")) {
        return NextResponse.json({ received: true });
      }

      await db.$transaction(async (tx) => {
        // Update user balance
        await tx.user.update({
          where: { id: transaction.receiverId! },
          data: {
            balance: {
              increment: BigInt(Math.round(Number(amount))),
            },
          },
        });

        // Update transaction status and description
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "completed",
            description: `MaxelPay Deposit Completed | Session: ${sessionId} | Order: ${orderId}`,
          },
        });
      });

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MaxelPay Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
