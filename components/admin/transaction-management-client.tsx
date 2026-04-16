"use client";

import { useState } from "react";
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
import { IconHistory, IconSearch, IconArrowUpRight, IconArrowDownRight, IconDownload, IconFilter } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string | null;
  description: string | null;
  createdAt: Date;
  sender: { name: string; accountNumber: string } | null;
  receiver: { name: string; accountNumber: string } | null;
}

export default function TransactionManagementClient({ transactions }: { transactions: Transaction[] }) {
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter(tx =>
    tx.description?.toLowerCase().includes(search.toLowerCase()) ||
    tx.sender?.name.toLowerCase().includes(search.toLowerCase()) ||
    tx.receiver?.name.toLowerCase().includes(search.toLowerCase()) ||
    tx.sender?.accountNumber.includes(search) ||
    tx.receiver?.accountNumber.includes(search) ||
    tx.type.toLowerCase().includes(search.toLowerCase()) ||
    tx.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-destructive">Global Transactions</h2>
          <p className="text-muted-foreground font-medium text-lg">Comprehensive audit trail of all financial activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 w-full md:w-[300px] h-12 rounded-xl bg-accent/20 border-transparent focus:bg-background transition-all font-medium"
            />
          </div>
          <Button variant="outline" size="icon" className="size-12 rounded-xl border-accent/30 hover:bg-accent/10">
            <IconDownload className="size-5" />
          </Button>
        </div>
      </div>

      <Card className="border-destructive/10 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Audit History</CardTitle>
              <CardDescription className="text-base font-medium">
                Showing all processed transfers and ATM activities.
              </CardDescription>
            </div>
            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <IconHistory className="size-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <IconSearch className="h-12 w-12 mb-4" />
              <p className="text-lg font-bold uppercase tracking-widest">No matching records</p>
              <p className="text-sm font-medium">Try broadening your search criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader className="bg-accent/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-8 py-4 font-bold text-[10px] uppercase tracking-widest">Transaction</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Sender</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Recipient</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest text-right">Amount</TableHead>
                      <TableHead className="pr-8 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="border-b border-accent/20 hover:bg-muted/30 transition-colors group">
                        <TableCell className="pl-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex aspect-square size-10 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110",
                              tx.type === 'transfer' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                            )}>
                              {tx.type === 'transfer' ? <IconArrowUpRight size={20} /> : <IconArrowDownRight size={20} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm tracking-tight capitalize">{tx.type}</span>
                              <span className="text-xs text-muted-foreground font-medium truncate max-w-[180px]">{tx.description}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{tx.sender?.name || 'SYSTEM'}</span>
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">{tx.sender?.accountNumber || '---'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{tx.receiver?.name || (tx.type === 'withdraw' ? 'ATM WITHDRAWAL' : 'UNKNOWN')}</span>
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">{tx.receiver?.accountNumber || '---'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-tight",
                            (tx.status === "completed" || !tx.status) ? "bg-green-50 text-green-700 border-green-200" :
                            tx.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {tx.status || "completed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-bold text-sm tracking-tighter",
                            tx.type === 'transfer' ? "text-primary" : "text-destructive"
                          )}>${(tx.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{new Date(tx.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] font-medium text-muted-foreground"> {new Date(tx.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden p-4 gap-4">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="p-6 border border-accent/30 rounded-3xl space-y-4 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex aspect-square size-10 items-center justify-center rounded-xl shadow-sm",
                          tx.type === 'transfer' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        )}>
                          {tx.type === 'transfer' ? <IconArrowUpRight size={20} /> : <IconArrowDownRight size={20} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight capitalize">{tx.type}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "font-bold text-lg tracking-tighter",
                          tx.type === 'transfer' ? "text-primary" : "text-destructive"
                        )}>${(tx.amount / 100).toLocaleString()}</span>
                        <Badge variant="outline" className={cn(
                          "rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-widest h-4",
                          (tx.status === "completed" || !tx.status) ? "bg-green-50 text-green-700 border-green-200" :
                          tx.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {tx.status || "completed"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-accent/20">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sender</span>
                        <span className="font-bold text-xs truncate">{tx.sender?.name || 'SYSTEM'}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recipient</span>
                        <span className="font-bold text-xs truncate">{tx.receiver?.name || (tx.type === 'withdraw' ? 'ATM' : 'SYSTEM')}</span>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                      &ldquo;{tx.description}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
