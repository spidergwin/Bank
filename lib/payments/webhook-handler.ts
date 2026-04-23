import { db } from "@/lib/db";
import { getProvider } from "./index";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function handleWebhook(providerId: string, req: Request) {
  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  try {
    const result = await provider.verifyWebhook(req);

    if (!result.isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { orderId, amount, status, providerReference } = result;

    if (status === 'completed') {
      // Find the pending transaction
      // We search by providerReference or orderId in the description
      const transaction = await db.transaction.findFirst({
        where: {
          type: "deposit",
          status: "pending",
          description: {
            contains: providerReference || orderId,
          },
        },
      });

      if (!transaction || !transaction.receiverId) {
        console.error(`Transaction not found for ${providerId} reference:`, providerReference || orderId);
        // Even if we don't find it, we might want to return 200 to stop retries if it's already processed
        // but since we check status: "pending", it might be already completed.
        const existingTx = await db.transaction.findFirst({
            where: {
                type: "deposit",
                description: {
                    contains: providerReference || orderId,
                },
            }
        });
        if (existingTx && existingTx.status === 'completed') {
            return NextResponse.json({ received: true, alreadyProcessed: true });
        }
        
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      await db.$transaction(async (tx) => {
        // Both NexaPay and MaxelPay send major units (e.g. 99.99)
        const amountInMinorUnits = Math.round(Number(amount) * 100);

        // Update user balance
        await tx.user.update({
          where: { id: transaction.receiverId! },
          data: {
            balance: {
              increment: amountInMinorUnits,
            },
          },
        });

        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "completed",
            description: `${provider.name} Deposit Completed | Ref: ${providerReference || orderId}`,
            amount: amountInMinorUnits,
          },
        });
      });

      revalidatePath("/dashboard");
      revalidatePath("/transactions");
    } else if (status === 'expired' || status === 'failed') {
      const transaction = await db.transaction.findFirst({
        where: {
          type: "deposit",
          status: "pending",
          description: {
            contains: providerReference || orderId,
          },
        },
      });

      if (transaction) {
        await db.transaction.update({
          where: { id: transaction.id },
          data: {
            status: status,
            description: `${provider.name} Deposit ${status.toUpperCase()} | Ref: ${providerReference || orderId}`,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`${provider.name} Webhook Error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
