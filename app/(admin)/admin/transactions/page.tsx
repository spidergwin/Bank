import { db } from "@/lib/db";
import TransactionManagementClient from "@/components/admin/transaction-management-client";

export default async function AdminTransactionsPage() {
  const transactions = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  const serializedTransactions = transactions.map(tx => ({
    ...tx,
    amount: Number(tx.amount),
    createdAt: tx.createdAt,
  }));

  return <TransactionManagementClient transactions={serializedTransactions} />;
}
