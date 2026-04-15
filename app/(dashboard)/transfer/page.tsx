"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { transferFunds, getReceiverName } from "@/server/actions";
import { IconArrowLeft, IconSend, IconUserCheck, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  accountNumber: z.string().length(10, "Account number must be exactly 10 digits"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid positive amount"),
  description: z.string().max(50, "Description must be under 50 characters").optional(),
});

export default function TransferPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountNumber: "",
      amount: "",
      description: "",
    },
    mode: "onChange",
  });

  const accountNumber = form.watch("accountNumber");

  useEffect(() => {
    const validateAccount = async () => {
      if (accountNumber.length === 10) {
        setIsValidating(true);
        try {
          const name = await getReceiverName(accountNumber);
          setReceiverName(name);
        } catch (error) {
          setReceiverName(null);
        } finally {
          setIsValidating(false);
        }
      } else {
        setReceiverName(null);
      }
    };

    const timer = setTimeout(validateAccount, 500);
    return () => clearTimeout(timer);
  }, [accountNumber]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!receiverName) {
      toast.error("Invalid recipient account. Please check the account number.");
      return;
    }

    setIsPending(true);
    try {
      const amountInCents = Math.round(Number(values.amount) * 100);
      const result = await transferFunds({
        receiverAccountNumber: values.accountNumber,
        amount: amountInCents,
        description: values.description,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Successfully sent $${Number(values.amount).toLocaleString()} to ${receiverName}`);
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent" nativeButton={false} render={
          <Link href="/dashboard">
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        } />
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Transfer Funds</h2>
          <p className="text-muted-foreground font-medium">Send money securely to any account</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-background">
        <CardHeader className="p-8 pb-0 md:p-10 md:pb-0">
          <CardTitle className="text-2xl font-bold">Transaction Details</CardTitle>
          <CardDescription className="text-base font-medium">
            Fill in the information below to complete your transfer.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="space-y-6">
              <Field>
                <FieldLabel htmlFor="accountNumber" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Recipient Account Number</FieldLabel>
                <div className="relative mt-1">
                  <Input
                    id="accountNumber"
                    placeholder="10-digit account number"
                    className={cn(
                      "h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background pr-12 transition-all font-mono",
                      receiverName && "border-green-500/50 bg-green-50/50"
                    )}
                    maxLength={10}
                    {...form.register("accountNumber")}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isValidating ? (
                      <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : receiverName ? (
                      <IconUserCheck className="h-5 w-5 text-green-600" />
                    ) : accountNumber.length === 10 && !isValidating && !receiverName ? (
                      <IconAlertCircle className="h-5 w-5 text-destructive" />
                    ) : null}
                  </div>
                </div>
                {receiverName && (
                  <div className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-green-700">Verified Recipient: {receiverName}</span>
                  </div>
                )}
                {form.formState.errors.accountNumber && (
                  <p className="text-destructive text-xs font-bold mt-2 flex items-center gap-1">
                    <IconAlertCircle size={14} />
                    {form.formState.errors.accountNumber.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Transfer Amount ($)</FieldLabel>
                <div className="relative mt-1">
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

              <Field>
                <FieldLabel htmlFor="description" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Reference / Note</FieldLabel>
                <Input 
                  id="description" 
                  placeholder="e.g. For monthly rent" 
                  className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all" 
                  {...form.register("description")} 
                />
                {form.formState.errors.description && (
                  <p className="text-destructive text-xs font-bold mt-2">{form.formState.errors.description.message}</p>
                )}
              </Field>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                  disabled={isPending || isValidating || !receiverName}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-5 w-5 animate-spin" />
                      Authorizing Transfer...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <IconSend className="h-5 w-5" />
                      Complete Secure Transfer
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
          End-to-end encrypted • Secure infrastructure
        </p>
      </div>
    </div>
  );
}
