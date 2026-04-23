import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  IconHistory,
  IconArrowLeft
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { TransactionList } from "@/components/transactions/transaction-list";

export default async function TransactionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  // Fetch all transactions
  const transactions = await db.transaction.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl" nativeButton={false} render={
          <Link href="/dashboard">
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        } />
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground font-medium">Full history of your account activity.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-bold">History</CardTitle>
          <CardDescription className="text-base font-medium">
            A detailed list of all your deposits, withdrawals, and transfers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IconHistory className="h-16 w-16 text-muted-foreground opacity-20" />
              <p className="mt-6 text-lg font-medium text-muted-foreground">No transaction history yet</p>
              <Button variant="outline" className="mt-4 rounded-xl font-bold" render={
                <Link href="/transfer">Start banking today</Link>
              } />
            </div>
          ) : (
            <TransactionList transactions={transactions} user={user} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
