"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { User, Transaction } from "@prisma/client";
import crypto from "crypto";
import { getProvider } from "@/lib/payments";

// Helper to serialize User/Transaction for JSON compatibility
function serializeUser(user: User | null) {
  if (!user) return null;
  return {
    ...user,
  };
}

function serializeTransaction(tx: Transaction | null) {
  if (!tx) return null;
  return {
    ...tx,
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
      if (sender.balance < amount) throw new Error("Insufficient balance");

      const receiver = await tx.user.findUnique({ where: { accountNumber: receiverAccountNumber } });
      if (!receiver) throw new Error("Receiver account not found");

      await tx.user.update({
        where: { id: senderId },
        data: { balance: { decrement: Math.round(amount) } },
      });

      await tx.user.update({
        where: { id: receiver.id },
        data: { balance: { increment: Math.round(amount) } },
      });

      return await tx.transaction.create({
        data: {
          amount: Math.round(amount),
          type: "transfer",
          description: description || `Transfer to ${receiver.name}`,
          status: "completed",
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
  withdrawalMethod: string;
  walletAddress: string;
  network: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  const userId = session.user.id;
  const { amount, description, withdrawalMethod, walletAddress, network } = formData;

  if (amount <= 0) return { error: "Amount must be greater than zero" };
  if (!walletAddress || !network) return { error: "Wallet address and network are required" };

  try {
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");
      if (user.isLocked) throw new Error(`Account Locked: ${user.lockedReason || "Your account has been restricted."}`);
      if (user.balance < (amount)) throw new Error("Insufficient balance");

      // Deduct balance immediately to prevent double spending
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: Math.round(amount) } },
      });

      return await tx.transaction.create({
        data: {
          amount: Math.round(amount),
          type: "withdraw",
          description: description || `Crypto Withdrawal (${network})`,
          status: "pending",
          withdrawalMethod: "CRYPTO",
          walletAddress,
          network,
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

export async function adminApproveWithdrawal(transactionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") return { error: "Unauthorized" };

  try {
    const tx = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx || tx.type !== "withdraw" || tx.status !== "pending") {
      return { error: "Invalid transaction" };
    }

    const updatedTx = await db.transaction.update({
      where: { id: transactionId },
      data: { status: "completed" },
    });

    revalidatePath("/admin/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, data: serializeTransaction(updatedTx) };
  } catch (err: unknown) {
    const error = err as Error;
    return { error: error.message || "Failed to approve withdrawal" };
  }
}

export async function adminDenyWithdrawal(transactionId: string, reason?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") return { error: "Unauthorized" };

  try {
    const result = await db.$transaction(async (txPrisma) => {
      const tx = await txPrisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!tx || tx.type !== "withdraw" || tx.status !== "pending") {
        throw new Error("Invalid transaction");
      }

      if (!tx.senderId) throw new Error("Sender not found");

      // Refund the user's balance
      await txPrisma.user.update({
        where: { id: tx.senderId },
        data: { balance: { increment: tx.amount } },
      });

      return await txPrisma.transaction.update({
        where: { id: transactionId },
        data: { 
          status: "denied",
          description: `${tx.description || ""} (Denied: ${reason || "Unspecified reason"})`
        },
      });
    });

    revalidatePath("/admin/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, data: serializeTransaction(result) };
  } catch (err: unknown) {
    const error = err as Error;
    return { error: error.message || "Failed to deny withdrawal" };
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
        ...(data.balance !== undefined && { balance: Math.round(data.balance * 100) }),
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
    const adjustment = type === 'add' ? Math.round(amount * 100) : -Math.round(amount * 100);
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

export async function createDeposit(amount: number, providerId: string = "nexapay") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return { error: "User not found" };

  const provider = getProvider(providerId);
  if (!provider) return { error: "Invalid provider" };

  const appUrl = process.env.NODE_ENV == "development" ? "http://127.0.0.1:3000" : (process.env.NEXT_PUBLIC_APP_URL || "");
  const orderId = `DEP-${user.id.slice(0, 8)}-${Date.now()}`;

  const result = await provider.createPayment({
    amount,
    orderId,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    appUrl,
  });

  if (result.success && result.url) {
    await db.transaction.create({
      data: {
        amount: Math.round(amount * 100),
        type: "deposit",
        status: "pending",
        description: `${provider.name} Deposit | Ref: ${result.providerReference || orderId}`,
        receiver: { connect: { id: user.id } },
        providerId: provider.id,
        providerReference: result.providerReference,
      }
    });

    return { success: true, url: result.url };
    } else {
    return { error: result.error || `Failed to initiate ${provider.name} payment` };
    }
    }

    export async function getResumeUrl(transactionId: string) {
    const session = await auth.api.getSession({
    headers: await headers(),
    });

    if (!session) return { error: "Unauthorized" };

    const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      receiverId: session.user.id,
      type: "deposit",
      status: "pending"
    }
    });
  if (!transaction || !transaction.providerId || !transaction.providerReference) {
    return { error: "Transaction not found or not eligible for resume" };
  }

  // Currently only Paymento is supported for resume logic in this specific way
  if (transaction.providerId === "paymento") {
    const url = `https://app.paymento.io/gateway?token=${transaction.providerReference}`;
    return { success: true, url };
  }

  return { error: "Resume not supported for this provider" };
}
