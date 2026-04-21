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
import { Button } from "@/components/ui/button";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconHistory,
  IconCreditCard,
  IconWallet,
  IconAlertTriangle
} from "@tabler/icons-react";
import Link from "next/link";
import { dashboardConfig } from "@/data/dashboard";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  // Redirect admin to admin panel
  if (user.role === "admin") {
    redirect("/admin");
  }

  // Fetch recent transactions
  const recentTransactions = await db.transaction.findMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      sender: true,
      receiver: true,
    },
  });

  const serializedTransactions = recentTransactions.map(tx => ({
    ...tx,
    amount: Number(tx.amount),
  }));

  const balance = Number(user.balance);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {user.isLocked && (
        <Alert variant="destructive" className="rounded-3xl border-destructive/50 bg-destructive/10 p-6">
          <IconAlertTriangle className="h-6 w-6" />
          <AlertTitle className="text-xl font-extrabold tracking-tight mb-2 uppercase">Account Temporarily Locked</AlertTitle>
          <AlertDescription className="text-base font-bold opacity-90 leading-relaxed">
            {user.lockedReason || "Your account has been restricted by an administrator. You currently cannot perform any transfers or withdrawals. Please contact support for more information."}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.firstName}</h2>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{dashboardConfig.balanceLabel}</CardTitle>
            <IconWallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(balance / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for immediate use</p>
          </CardContent>
          <div className="absolute top-0 right-0 h-full w-1/4 -rotate-12 transform bg-primary/10 blur-3xl" />
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{dashboardConfig.accountNumberLabel}</CardTitle>
            <IconCreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-widest">{user.accountNumber}</div>
            <p className="text-xs text-muted-foreground mt-1">Bank Account No.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" nativeButton={false} className="flex-1 min-w-[100px]" render={
              <Link href="/transfer">
                <IconArrowUpRight className="mr-2 h-4 w-4" />
                Transfer
              </Link>
            } />
            <Button size="sm" nativeButton={false} variant="secondary" className="flex-1 min-w-[100px]" render={
              <Link href="/deposit">
                <IconArrowDownRight className="mr-2 h-4 w-4" />
                Deposit
              </Link>
            } />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{dashboardConfig.recentTransactionsLabel}</CardTitle>
            <CardDescription>
              Your most recent financial activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconHistory className="h-12 w-12 text-muted-foreground opacity-20" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">No transactions yet</p>
                <Button nativeButton={false} variant="link" size="sm" className="mt-2" render={
                  <Link href="/transfer">Make your first transfer</Link>
                } />
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => {
                  const isSender = tx.senderId === user.id;
                  const amount = (Number(tx.amount) / 100).toFixed(2);
                  const status = tx.status || "completed";

                  return (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full relative",
                          isSender ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                        )}>
                          {isSender ? <IconArrowUpRight className="h-5 w-5" /> : <IconArrowDownRight className="h-5 w-5" />}
                          {status === "pending" && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {isSender ? `Sent to ${tx.receiver ? `${tx.receiver.firstName} ${tx.receiver.lastName}` : 'Unknown'}` : `Received from ${tx.sender ? `${tx.sender.firstName} ${tx.sender.lastName}` : 'Deposit'}`}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.type}
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-tight px-1.5 rounded-sm",
                              status === "completed" ? "text-green-600 bg-green-50 dark:bg-green-900/20" :
                                status === "pending" ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" :
                                  "text-red-600 bg-red-50 dark:bg-red-900/20"
                            )}>
                              {status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm font-bold",
                        isSender ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                      )}>
                        {isSender ? '-' : '+'}${amount}
                      </p>
                    </div>
                  );
                })}
                <Button variant="outline" nativeButton={false} className="w-full mt-4" render={
                  <Link href="/transactions">View All Transactions</Link>
                } />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>System Stats</CardTitle>
            <CardDescription>
              Real-time banking simulation metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Status</p>
                <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Active
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-600" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Security Overview</h4>
              <div className="flex items-center justify-between text-sm">
                <span>Encryption</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">AES-256</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Verification</span>
                <span className="text-green-600 font-medium">Verified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
