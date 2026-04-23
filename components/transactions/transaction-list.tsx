"use client";

import { useState } from "react";
import { Transaction, User } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { TransactionDetails } from "./transaction-details";

interface TransactionWithUsers extends Transaction {
  sender?: User | null;
  receiver?: User | null;
}

interface TransactionListProps {
  transactions: TransactionWithUsers[];
  user: { id: string }; // Use simplified type to avoid session user vs prisma user mismatches
}

export function TransactionList({ transactions, user }: TransactionListProps) {
  const [selectedTx, setSelectedTx] = useState<TransactionWithUsers | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleRowClick = (tx: TransactionWithUsers) => {
    setSelectedTx(tx);
    setIsDetailsOpen(true);
  };

  return (
    <>
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
            {transactions.map((tx) => {
              const isSender = tx.senderId === user.id;
              const amount = (tx.amount / 100).toFixed(2);
              const status = tx.status || "completed";

              return (
                <TableRow 
                  key={tx.id} 
                  className="border-b border-accent/20 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => handleRowClick(tx)}
                >
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-110",
                        isSender ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      )}>
                        {isSender ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
                      </div>
                      <span className="capitalize font-bold text-xs uppercase tracking-tight">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate font-medium text-sm">
                    {tx.description || (
                      isSender 
                        ? (tx.type === 'withdraw' ? 'Crypto Withdrawal' : `To ${tx.receiver ? `${tx.receiver.firstName} ${tx.receiver.lastName}` : 'Unknown'}`) 
                        : `From ${tx.sender ? `${tx.sender.firstName} ${tx.sender.lastName}` : 'Deposit'}`
                    )}
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

      <div className="grid grid-cols-1 gap-4 md:hidden p-4">
        {transactions.map((tx) => {
          const isSender = tx.senderId === user.id;
          const amount = (tx.amount / 100).toFixed(2);
          const status = tx.status || "completed";

          return (
            <div 
              key={tx.id} 
              className="flex flex-col p-5 border border-accent/30 rounded-3xl bg-accent/5 gap-4 active:scale-[0.98] transition-all cursor-pointer"
              onClick={() => handleRowClick(tx)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm",
                    isSender ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  )}>
                    {isSender ? <IconArrowUpRight className="h-5 w-5" /> : <IconArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold tracking-tight truncate">
                      {tx.description || (
                        isSender 
                          ? (tx.type === 'withdraw' ? 'Crypto Withdrawal' : `To ${tx.receiver ? `${tx.receiver.firstName} ${tx.receiver.lastName}` : 'Unknown'}`) 
                          : `From ${tx.sender ? `${tx.sender.firstName} ${tx.sender.lastName}` : 'Deposit'}`
                      )}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                      {new Date(tx.createdAt).toLocaleDateString()} • {tx.type}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  "text-base font-bold tracking-tighter flex-shrink-0",
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

      <TransactionDetails 
        transaction={selectedTx} 
        isOpen={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
      />
    </>
  );
}
