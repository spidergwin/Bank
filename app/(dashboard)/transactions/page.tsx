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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconHistory,
  IconArrowLeft
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

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

  const serializedTransactions = transactions.map(tx => ({
    ...tx,
    amount: Number(tx.amount),
  }));

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
          {serializedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IconHistory className="h-16 w-16 text-muted-foreground opacity-20" />
              <p className="mt-6 text-lg font-medium text-muted-foreground">No transaction history yet</p>
              <Button variant="outline" className="mt-4 rounded-xl font-bold" render={
                <Link href="/transfer">Start banking today</Link>
              } />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-accent/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-8 py-4 font-bold text-[10px] uppercase tracking-widest">Type</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Description</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Date</TableHead>
                      <TableHead className="pr-8 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serializedTransactions.map((tx) => {
                      const isSender = tx.senderId === user.id;
                      const amount = (tx.amount / 100).toFixed(2);
                      const status = tx.status || "completed";

                      return (
                        <TableRow key={tx.id} className="border-b border-accent/20 hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm",
                                isSender ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                              )}>
                                {isSender ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
                              </div>
                              <span className="capitalize font-bold text-xs uppercase tracking-tight">{tx.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate font-medium text-sm">
                            {tx.description || (isSender ? `To ${tx.receiver?.name}` : `From ${tx.sender?.name}`)}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                              status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                              (status === "failed" || status === "expired") && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                              {status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className={cn(
                            "pr-8 text-right font-bold text-sm tracking-tighter",
                            isSender ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                          )}>
                            {isSender ? '-' : '+'}${amount}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                {serializedTransactions.map((tx) => {
                  const isSender = tx.senderId === user.id;
                  const amount = (tx.amount / 100).toFixed(2);
                  const status = tx.status || "completed";

                  return (
                    <div key={tx.id} className="flex flex-col p-5 border border-accent/30 rounded-3xl bg-accent/5 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
                            isSender ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                          )}>
                            {isSender ? <IconArrowUpRight className="h-5 w-5" /> : <IconArrowDownRight className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight">
                              {tx.description || (isSender ? `To ${tx.receiver?.name}` : `From ${tx.sender?.name}`)}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {new Date(tx.createdAt).toLocaleDateString()} • {tx.type}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-base font-bold tracking-tighter",
                          isSender ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                        )}>
                          {isSender ? '-' : '+'}${amount}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-accent/20">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                          status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                          status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                          (status === "failed" || status === "expired") && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
