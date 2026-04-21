import { db } from "@/lib/db";
import { Transaction } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  IconUsers,
  IconHistory,
  IconWallet,
  IconShieldCheck,
  IconArrowUpRight,
  IconArrowDownRight,
  IconChartBar
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  const totalUsers = await db.user.count();
  const totalTransactions = await db.transaction.count();
  const totalBalancesResult = await db.user.aggregate({
    _sum: {
      balance: true,
    },
  });
  const totalBalances = Number(totalBalancesResult._sum.balance || 0);

  const recentUsers = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentTransactions = await db.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      sender: true,
      receiver: true,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-destructive">System Overview</h2>
        <p className="text-muted-foreground">Comprehensive status of the Luma Bank simulation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <IconUsers className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform-wide registrations</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <IconHistory className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Total system activity</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Circulating Funds</CardTitle>
            <IconWallet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBalances / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregate system balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-destructive/10">
          <CardHeader className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent System Transactions</CardTitle>
              <CardDescription>
                Live feed of all banking activities.
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost" render={
              <Link href="/admin/transactions">View All</Link>
            } />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => {
                const amount = (Number(tx.amount) / 100).toFixed(2);

                return (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/5 text-destructive">
                        {tx.type === 'transfer' ? <IconArrowUpRight className="h-5 w-5" /> : <IconArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[200px]">
                          {tx.sender ? `${tx.sender.firstName} ${tx.sender.lastName}` : 'System'} → {tx.receiver ? `${tx.receiver.firstName} ${tx.receiver.lastName}` : (tx.type === 'withdraw' ? 'ATM' : 'System')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleTimeString()} • {tx.type}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">${amount}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-destructive/10">
          <CardHeader className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>New Users</CardTitle>
              <CardDescription>
                Recently registered accounts.
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost" nativeButton={false} render={
              <Link href="/admin/users">View All</Link>
            } />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconUsers className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate max-w-[150px]">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{u.email}</p>
                    </div>
                  </div>
                  <p className="text-xs font-mono bg-muted px-2 py-0.5 rounded truncate max-w-[100px]">{u.accountNumber}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
