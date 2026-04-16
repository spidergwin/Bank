import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-nexapay-signature");
    const timestamp = req.headers.get("x-nexapay-timestamp");
    const rawBody = await req.text(); // Need raw text for HMAC
    const payload = JSON.parse(rawBody);

    if (!signature || !timestamp) {
      return NextResponse.json({ error: "No signature or timestamp provided" }, { status: 400 });
    }

    const webhookSecret = process.env.NEXAPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("NEXAPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify HMAC signature: sha256=HMAC(secret, timestamp + "." + payload)
    const expectedSig = 'sha256=' + crypto
      .createHmac('sha256', webhookSecret)
      .update(timestamp + '.' + rawBody)
      .digest('hex');

    if (signature !== expectedSig) {
      console.error("Invalid NexaPay signature", { received: signature, expected: expectedSig });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Replay protection: maxAge = 5 minutes
    const maxAge = 5 * 60 * 1000;
    if (Math.abs(Date.now() - parseInt(timestamp)) > maxAge) {
      return NextResponse.json({ error: "Webhook expired" }, { status: 401 });
    }

    // Process payment status
    const { order_id, status, amount } = payload;

    if (status === 'completed') {
      // Find the pending transaction by the order_id stored in its description
      const transaction = await db.transaction.findFirst({
        where: {
          type: "deposit",
          description: {
            contains: order_id
          }
        },
        include: {
          receiver: true
        }
      });

      if (!transaction || !transaction.receiverId) {
        console.error("Transaction or User not found for order_id:", order_id);
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      await db.$transaction(async (tx) => {
        // Update user balance
        await tx.user.update({
          where: { id: transaction.receiverId! },
          data: { balance: { increment: Number(amount) } }
        });

        // Update transaction description to completed and clear pending status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            amount: Number(amount), // Update with actual paid amount if different
            description: `NexaPay Deposit Completed | Order ID: ${order_id}`
          }
        });
      });

      revalidatePath("/dashboard");
      revalidatePath("/transactions");
    } else if (status === 'expired' || status === 'failed') {
      // Find and update the pending transaction to reflect the failure/expiration
      const transaction = await db.transaction.findFirst({
        where: {
          type: "deposit",
          description: {
            contains: order_id
          }
        }
      });

      if (transaction) {
        await db.transaction.update({
          where: { id: transaction.id },
          data: {
            description: `NexaPay Deposit ${status.toUpperCase()} | Order ID: ${order_id}`
          }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
