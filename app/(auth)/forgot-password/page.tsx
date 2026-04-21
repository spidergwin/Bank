"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { IconLoader2, IconAlertCircle, IconMailForward, IconArrowLeft } from "@tabler/icons-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await authClient.forgetPassword({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        setError(error.message || "Failed to send reset link. Please try again.");
        toast.error("Request failed");
      } else {
        setIsSuccess(true);
        toast.success("Reset link sent!");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto flex aspect-square size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-2">
            <IconMailForward className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Email Sent</h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            If an account exists for <span className="text-foreground font-bold">{form.getValues("email")}</span>, you will receive a password reset link shortly.
          </p>
          <div className="pt-4">
            <Button variant="outline" className="rounded-xl w-full h-12 font-bold" render={
              <Link href="/login">Back to Sign In</Link>
            } />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2 mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Forgot password?</h1>
        <p className="text-muted-foreground font-medium">No worries, we&apos;ll send you reset instructions</p>
      </div>

      <Card className="w-full border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-background">
        <CardContent className="p-8 md:p-10">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-sm font-bold text-destructive animate-in fade-in zoom-in-95 duration-200">
              <IconAlertCircle className="size-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                  {...form.register("email")}
                  required
                />
                {form.formState.errors.email && (
                  <p className="text-destructive text-xs font-medium mt-1">{form.formState.errors.email.message}</p>
                )}
              </Field>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Sending reset link...
                  </span>
                ) : "Reset Password"}
              </Button>
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                <IconArrowLeft size={16} />
                Back to Sign In
              </Link>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
