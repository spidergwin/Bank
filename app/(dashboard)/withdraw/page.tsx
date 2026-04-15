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
import { withdrawFunds } from "@/server/actions";
import { IconArrowLeft, IconCash, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid positive amount"),
  description: z.string().max(50, "Description must be under 50 characters").optional(),
});

export default function WithdrawPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    try {
      const amountInCents = Math.round(Number(values.amount) * 100);
      const result = await withdrawFunds({
        amount: amountInCents,
        description: values.description,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Successfully withdrew $${Number(values.amount).toLocaleString()}`);
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
        <Button nativeButton={false} variant="ghost" size="icon" className="rounded-xl hover:bg-accent" render={
          <Link href="/dashboard">
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        } />
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Withdraw Funds</h2>
          <p className="text-muted-foreground font-medium">Fast and secure cash withdrawals</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-background">
        <CardHeader className="p-8 pb-0 md:p-10 md:pb-0">
          <CardTitle className="text-2xl font-bold">ATM Withdrawal</CardTitle>
          <CardDescription className="text-base font-medium">
            Enter the amount you wish to withdraw from your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="space-y-6">
              <Field>
                <FieldLabel htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Amount to Withdraw ($)</FieldLabel>
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
                <FieldLabel htmlFor="description" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Reference / Memo</FieldLabel>
                <Input 
                  id="description" 
                  placeholder="e.g. Personal cash" 
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
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-5 w-5 animate-spin" />
                      Processing Withdrawal...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <IconCash className="h-5 w-5" />
                      Complete Withdrawal
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
          Available 24/7 • Instant Processing
        </p>
      </div>
    </div>
  );
}
