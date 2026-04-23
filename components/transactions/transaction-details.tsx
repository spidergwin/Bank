"use client";

import { Transaction, User } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconCalendar, 
  IconFingerprint, 
  IconWallet, 
  IconCheck, 
  IconLoader2, 
  IconAlertCircle,
  IconExternalLink
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getResumeUrl } from "@/server/actions";
import { toast } from "sonner";

interface TransactionWithUsers extends Transaction {
  sender?: User | null;
  receiver?: User | null;
}

interface TransactionDetailsProps {
  transaction: TransactionWithUsers | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetails({ transaction, isOpen, onOpenChange }: TransactionDetailsProps) {
  const [isResuming, setIsResuming] = useState(false);

  if (!transaction) return null;

  const isSender = transaction.senderId === transaction.sender?.id && !!transaction.senderId;
  const isDeposit = transaction.type === "deposit";
  const isWithdraw = transaction.type === "withdraw";
  const amount = (transaction.amount / 100).toFixed(2);
  const status = transaction.status || "completed";

  const handleResume = async () => {
    setIsResuming(true);
    try {
      const result = await getResumeUrl(transaction.id);
      if (result.success && result.url) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Could not resume payment");
      }
    } catch (err) {
      toast.error("An error occurred while resuming payment");
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/50 bg-background/95 backdrop-blur-md p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="p-8 text-left border-b border-border/50 bg-accent/5">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
                isSender ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
              )}>
                {isSender ? <IconArrowUpRight size={28} /> : <IconArrowDownRight size={28} />}
              </div>
              <div>
                <SheetTitle className="text-2xl font-extrabold tracking-tight">
                  Transaction Detail
                </SheetTitle>
                <SheetDescription className="font-medium">
                  {transaction.type.toUpperCase()} • {status.toUpperCase()}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-8 space-y-8">
            {/* Amount Section */}
            <div className="text-center p-8 rounded-3xl bg-accent/10 border border-accent/20">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Total Amount</p>
              <h3 className={cn(
                "text-5xl font-black tracking-tighter",
                isSender ? "text-red-500" : "text-green-500"
              )}>
                {isSender ? '-' : '+'}${amount}
              </h3>
            </div>

            {/* Details Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <IconCalendar size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Date & Time</span>
                </div>
                <span className="text-sm font-semibold">
                  {new Date(transaction.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-muted-foreground flex-shrink-0">
                  <IconFingerprint size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Transaction ID</span>
                </div>
                <span className="text-xs font-mono font-medium bg-accent/20 px-2 py-1 rounded-md break-all text-right">
                  {transaction.id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-muted-foreground flex-shrink-0">
                  <IconWallet size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Method</span>
                </div>
                <span className="text-sm font-semibold capitalize truncate text-right">
                  {isWithdraw ? (transaction.network || "Crypto") : (transaction.providerId || transaction.type)}
                </span>
              </div>

              {isWithdraw && transaction.withdrawalMethod === "CRYPTO" && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-muted-foreground flex-shrink-0">
                      <IconWallet size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Network</span>
                    </div>
                    <span className="text-sm font-semibold text-right">
                      {transaction.network}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <IconFingerprint size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Wallet Address</span>
                    </div>
                    <span className="text-[10px] font-mono font-medium bg-accent/20 p-4 rounded-xl break-all">
                      {transaction.walletAddress}
                    </span>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Description</p>
                <p className="text-sm font-medium leading-relaxed bg-accent/5 p-4 rounded-2xl border border-accent/10 break-words">
                  {transaction.description || "No description provided for this transaction."}
                </p>
              </div>

              {/* Status Section */}
              <div className="pt-4">
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl border",
                  status === "completed" ? "bg-green-500/5 border-green-500/20 text-green-600" :
                  status === "pending" ? "bg-amber-500/5 border-amber-500/20 text-amber-600" :
                  "bg-red-500/5 border-red-500/20 text-red-500"
                )}>
                  {status === "completed" ? <IconCheck size={20} strokeWidth={3} /> :
                   status === "pending" ? <IconLoader2 size={20} className="animate-spin" /> :
                   <IconAlertCircle size={20} />}
                  <span className="text-sm font-bold uppercase tracking-widest">
                    Payment {status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button for Pending Deposits */}
        {isDeposit && status === "pending" && (
          <div className="p-8 bg-background border-t border-border/50">
            <Button 
              onClick={handleResume} 
              disabled={isResuming}
              className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isResuming ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconExternalLink className="h-5 w-5" />
                  Resume Payment
                </span>
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest mt-4">
              Securely handled by {transaction.providerId || "Paymento"}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
