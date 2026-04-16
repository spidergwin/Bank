"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createDeposit } from "@/server/actions";
import { IconArrowLeft, IconCreditCard, IconLoader2, IconAlertCircle, IconExternalLink, IconCurrencyBitcoin, IconCheck, IconCurrencyEthereum, IconCurrencySolana, IconCoins } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1.00, "Minimum deposit amount is $1.00"),
  provider: z.enum(["nexapay", "maxelpay"]),
});

export default function DepositPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      provider: "nexapay",
    },
    mode: "onChange",
  });

  const selectedProvider = form.watch("provider");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    try {
      const amount = Number(values.amount);
      const result = await createDeposit(amount, values.provider);

      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        toast.success(`Redirecting to ${values.provider === "nexapay" ? "NexaPay" : "MaxelPay"}...`);
        window.location.href = result.url;
      } else {
        toast.error("Failed to get payment URL. Please try again.");
      }
    } catch (err) {
      console.error("Deposit Error:", err);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button nativeButton={false} variant="ghost" size="icon" className="rounded-xl hover:bg-accent" render={
          <Link href="/dashboard">
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        } />
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Deposit Funds</h2>
          <p className="text-muted-foreground font-medium">Add money to your account securely</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-background">
        <CardHeader className="p-8 pb-0 md:p-10 md:pb-0">
          <CardTitle className="text-2xl font-bold">Quick Deposit</CardTitle>
          <CardDescription className="text-base font-medium">
            Enter the amount and choose your preferred payment method.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="space-y-8">
              <Field>
                <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 block">Select Payment Method</FieldLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => form.setValue("provider", "nexapay")}
                    className={cn(
                      "relative flex flex-col items-start p-6 rounded-[1.5rem] border-2 text-left transition-all duration-200 group",
                      selectedProvider === "nexapay" 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-accent/50 bg-accent/10 hover:border-accent hover:bg-accent/20"
                    )}
                  >
                    <div className={cn(
                      "mb-4 p-3 rounded-xl transition-colors",
                      selectedProvider === "nexapay" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground group-hover:text-foreground"
                    )}>
                      <IconCreditCard size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg tracking-tight">NexaPay</p>
                      <p className="text-xs text-muted-foreground font-medium">Credit / Debit Card</p>
                    </div>
                    {selectedProvider === "nexapay" && (
                      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <IconCheck size={14} strokeWidth={4} />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => form.setValue("provider", "maxelpay")}
                    className={cn(
                      "relative flex flex-col items-start p-6 rounded-[1.5rem] border-2 text-left transition-all duration-200 group",
                      selectedProvider === "maxelpay" 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-accent/50 bg-accent/10 hover:border-accent hover:bg-accent/20"
                    )}
                  >
                    <div className="mb-4 flex items-center h-[48px]">
                      <AvatarGroup className="-space-x-3">
                        <Avatar className={cn(
                          "size-10 border-2 border-background shadow-sm",
                          selectedProvider === "maxelpay" ? "bg-primary text-primary-foreground" : "bg-background text-[#F7931A]"
                        )}>
                          <AvatarFallback className="bg-inherit">
                            <IconCurrencyBitcoin size={20} strokeWidth={2.5} />
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className={cn(
                          "size-10 border-2 border-background shadow-sm",
                          selectedProvider === "maxelpay" ? "bg-primary text-primary-foreground" : "bg-background text-[#627EEA]"
                        )}>
                          <AvatarFallback className="bg-inherit">
                            <IconCurrencyEthereum size={20} strokeWidth={2.5} />
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className={cn(
                          "size-10 border-2 border-background shadow-sm",
                          selectedProvider === "maxelpay" ? "bg-primary text-primary-foreground" : "bg-background text-[#14F195]"
                        )}>
                          <AvatarFallback className="bg-inherit">
                            <IconCurrencySolana size={20} strokeWidth={2.5} />
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className={cn(
                          "size-10 border-2 border-background shadow-sm",
                          selectedProvider === "maxelpay" ? "bg-primary text-primary-foreground" : "bg-background text-primary/40"
                        )}>
                          <AvatarFallback className="bg-inherit">
                            <IconCoins size={20} strokeWidth={2.5} />
                          </AvatarFallback>
                        </Avatar>
                      </AvatarGroup>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg tracking-tight">MaxelPay</p>
                      <p className="text-xs text-muted-foreground font-medium">Crypto Assets</p>
                    </div>
                    {selectedProvider === "maxelpay" && (
                      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <IconCheck size={14} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Amount to Deposit ($)</FieldLabel>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                  <Input 
                    id="amount" 
                    placeholder="0.00" 
                    className="h-14 rounded-xl bg-accent/30 border-transparent focus:bg-background pl-10 text-xl font-bold transition-all" 
                    {...form.register("amount")} 
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="text-destructive text-xs font-bold mt-2 flex items-center gap-1">
                    <IconAlertCircle size={14} />
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </Field>
              
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  {selectedProvider === "nexapay" ? <IconCreditCard size={18} /> : <IconCoins size={18} />}
                  <span className="text-sm font-bold">Secure Payment via {selectedProvider === "nexapay" ? "NexaPay" : "MaxelPay"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {selectedProvider === "nexapay" 
                    ? "We use NexaPay for secure, encrypted card payments. Your funds will be credited instantly upon confirmation."
                    : "MaxelPay handles our crypto deposits securely. Your funds will be credited after blockchain confirmation."}
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-5 w-5 animate-spin" />
                      Connecting to {selectedProvider === "nexapay" ? "NexaPay" : "MaxelPay"}...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <IconExternalLink className="h-5 w-5" />
                      Proceed with {selectedProvider === "nexapay" ? "NexaPay" : "MaxelPay"}
                    </span>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div className="p-6 rounded-[2rem] bg-accent/20 border border-accent/30 text-center">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Secure Payments Powered by {selectedProvider === "nexapay" ? "NexaPay.one" : "MaxelPay.com"}
        </p>
      </div>
    </div>
  );
}
