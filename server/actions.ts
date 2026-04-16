"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { User, Transaction } from "@prisma/client";
import crypto from "crypto";

// Helper to serialize BigInt to Number for JSON compatibility
function serializeUser(user: User | null) {
  if (!user) return null;
  return {
    ...user,
    balance: Number(user.balance),
  };
}

function serializeTransaction(tx: Transaction | null) {
  if (!tx) return null;
  return {
    ...tx,
    amount: Number(tx.amount),
  };
}

export async function transferFunds(formData: {
  receiverAccountNumber: string;
  amount: number;
  description?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  const senderId = session.user.id;
  const { receiverAccountNumber, amount, description } = formData;

  if (amount <= 0) return { error: "Amount must be greater than zero" };

  try {
    const result = await db.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({ where: { id: senderId } });
      if (!sender) throw new Error("Sender not found");
      if (sender.isLocked) throw new Error(`Account Locked: ${sender.lockedReason || "Your account has been restricted."}`);
      if (sender.accountNumber === receiverAccountNumber) throw new Error("Cannot send money to yourself");
      if (Number(sender.balance) < amount) throw new Error("Insufficient balance");

      const receiver = await tx.user.findUnique({ where: { accountNumber: receiverAccountNumber } });
      if (!receiver) throw new Error("Receiver account not found");

      await tx.user.update({
        where: { id: senderId },
        data: { balance: { decrement: Number(amount) } },
      });

      await tx.user.update({
        where: { id: receiver.id },
        data: { balance: { increment: Number(amount) } },
      });

      return await tx.transaction.create({
        data: {
          amount: Number(amount),
          type: "transfer",
          description: description || `Transfer to ${receiver.name}`,
          senderId: senderId,
          receiverId: receiver.id,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, data: serializeTransaction(result) };
  } catch (err: unknown) {
    const error = err as Error;
    return { error: error.message || "Transfer failed" };
  }
}

export async function getReceiverName(accountNumber: string) {
  if (accountNumber.length !== 10) return null;
  const receiver = await db.user.findUnique({
    where: { accountNumber },
    select: { name: true }
  });
  return receiver?.name || null;
}

export async function withdrawFunds(formData: {
  amount: number;
  description?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  const userId = session.user.id;
  const { amount, description } = formData;

  if (amount <= 0) return { error: "Amount must be greater than zero" };

  try {
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");
      if (user.isLocked) throw new Error(`Account Locked: ${user.lockedReason || "Your account has been restricted."}`);
      if (Number(user.balance) < amount) throw new Error("Insufficient balance");

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: Number(amount) } },
      });

      return await tx.transaction.create({
        data: {
          amount: Number(amount),
          type: "withdraw",
          description: description || "ATM Withdrawal",
          senderId: userId,
          receiverId: null,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, data: serializeTransaction(result) };
  } catch (err: unknown) {
    const error = err as Error;
    return { error: error.message || "Withdrawal failed" };
  }
}

export async function adminUpdateUser(userId: string, data: {
  name?: string;
  email?: string;
  role?: string;
  balance?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") return { error: "Unauthorized" };

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        ...(data.balance !== undefined && { balance: Number(Math.round(data.balance)) }),
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true, data: serializeUser(updatedUser) };
  } catch (err: unknown) {
    const error = err as Error;
    return { error: error.message || "Failed to update user" };
  }
}

export async function adminAdjustUserBalance(userId: string, amount: number, type: 'add' | 'deduct') {
  console.log(`adminAdjustUserBalance: userId=${userId}, amount=${amount}, type=${type}`);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    console.log("adminAdjustUserBalance: Unauthorized access attempt.");
    return { error: "Unauthorized" };
  }

  try {
    const adjustment = type === 'add' ? Number(amount) : -Number(amount);
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { balance: { increment: adjustment } },
    });

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    console.log("adminAdjustUserBalance: User balance updated successfully", updatedUser);
    return { success: true, data: serializeUser(updatedUser) };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("adminAdjustUserBalance: Error updating balance", error);
    return { error: error.message || `Failed to ${type} funds` };
  }
}

export async function adminToggleUserLock(userId: string, isLocked: boolean, reason?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") return { error: "Unauthorized" };

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isLocked,
        lockedReason: isLocked ? (reason || "Account locked by administrator") : null
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true, data: serializeUser(updatedUser) };
  } catch (err: unknown) {
    const error = err as Error;
    return { error: error.message || `Failed to ${isLocked ? 'lock' : 'unlock'} account` };
  }
}

export async function adminDeleteUser(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") return { error: "Unauthorized" };

  try {
    await db.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { error: error.message || "Failed to delete user" };
  }
}

export async function createDeposit(amount: number, provider: "nexapay" | "maxelpay" = "nexapay") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return { error: "User not found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const orderId = `DEP-${user.id.slice(0, 8)}-${Date.now()}`;

  if (provider === "nexapay") {
    const apiKey = process.env.NEXAPAY_API_KEY;
    const apiUrl = process.env.NEXAPAY_API_URL || "https://nexapay.one/api/v1";

    if (!apiKey) {
      console.error("NexaPay API Key missing");
      return { error: "NexaPay configuration missing" };
    }

    const payload = {
      amount: Number(amount),
      currency: "USD",
      crypto: "USDC", // Settlement crypto
      description: `Deposit for ${user.name} (Order ${orderId})`,
      customer_email: user.email,
      success_url: `${appUrl}/dashboard?status=success`,
      cancel_url: `${appUrl}/deposit?status=cancelled`,
      callback_url: `${appUrl}/api/webhooks/nexapay`,
    };

    try {
      const response = await fetch(`${apiUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success && result.payment) {
        await db.transaction.create({
          data: {
            amount: Number(amount),
            type: "deposit",
            description: `NexaPay Deposit (Pending) | ID: ${result.payment.order_id}`,
            senderId: null,
            receiverId: user.id,
          }
        });

        return { success: true, url: result.payment.checkout_url };
      } else {
        console.error("NexaPay API Error:", result);
        return { error: result.message || "Failed to initiate NexaPay payment" };
      }
    } catch (error) {
      console.error("NexaPay Network Error:", error);
      return { error: "Failed to connect to NexaPay" };
    }
  } else if (provider === "maxelpay") {
    const apiKey = process.env.MAXELPAY_API_KEY;
    const apiUrl = process.env.MAXELPAY_API_URL || "https://api.maxelpay.com/api/v1";

    if (!apiKey) {
      console.error("MaxelPay API Key missing");
      return { error: "MaxelPay configuration missing" };
    }

    const payload = {
      orderId: orderId,
      amount: Number(amount),
      currency: "USD",
      description: `Deposit for ${user.name} (Order ${orderId})`,
      successUrl: `${appUrl}/dashboard?status=success`,
      cancelUrl: `${appUrl}/deposit?status=cancelled`,
      callbackUrl: `${appUrl}/api/webhooks/maxelpay`,
    };

    try {
      const response = await fetch(`${apiUrl}/payments/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.sessionId && result.url) {
        await db.transaction.create({
          data: {
            amount: Number(amount),
            type: "deposit",
            description: `MaxelPay Deposit (Pending) | Session: ${result.sessionId}`,
            senderId: null,
            receiverId: user.id,
          }
        });

        return { success: true, url: result.url };
      } else {
        console.error("MaxelPay API Error:", result);
        return { error: result.message || "Failed to initiate MaxelPay payment" };
      }
    } catch (error) {
      console.error("MaxelPay Network Error:", error);
      return { error: "Failed to connect to MaxelPay" };
    }
  }

  return { error: "Invalid provider" };
}
