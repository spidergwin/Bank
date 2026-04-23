"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { IconEye, IconEyeOff, IconLoader2, IconCheck, IconAlertCircle, IconLockCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error("Invalid or expired token");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token: token,
      });

      if (error) {
        setError(error.message || "Failed to reset password. The link may have expired.");
        toast.error("Reset failed");
      } else {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 min-h-[40vh]">
        <div className="text-center space-y-4 max-w-sm p-8 rounded-[2rem] bg-destructive/5 border border-destructive/10">
          <div className="mx-auto flex aspect-square size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-2">
            <IconAlertCircle className="size-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Invalid Link</h1>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            This password reset link is invalid or has expired. Please request a new link to continue.
          </p>
          <div className="pt-4">
            <Button variant="outline" className="rounded-xl w-full h-12 font-bold" render={
              <Link href="/forgot-password">Request New Link</Link>
            } />
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500 min-h-[40vh]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto flex aspect-square size-20 items-center justify-center rounded-3xl bg-green-100 text-green-600 mb-2">
            <IconLockCheck className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Password Reset</h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Your password has been successfully updated. You will be redirected to the sign-in page in a moment.
          </p>
          <div className="pt-4">
            <Button className="rounded-xl w-full h-12 font-bold shadow-lg shadow-primary/20" render={
              <Link href="/login">Sign In Now</Link>
            } />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto p-4">
      <div className="text-center space-y-2 mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Set new password</h1>
        <p className="text-muted-foreground font-medium">Please enter your new secure password</p>
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
                <FieldLabel htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">New Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background pr-12 transition-all"
                    {...form.register("password")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 p-4 rounded-xl bg-accent/20 border border-accent/30">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={cn(
                        "flex aspect-square size-4 items-center justify-center rounded-full border transition-colors",
                        req.met ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30 text-transparent"
                      )}>
                        <IconCheck size={10} strokeWidth={4} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-tight transition-colors",
                        req.met ? "text-foreground" : "text-muted-foreground"
                      )}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Confirm New Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                  {...form.register("confirmPassword")}
                  required
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-destructive text-[10px] font-bold mt-1 uppercase tracking-tight">{form.formState.errors.confirmPassword.message}</p>
                )}
              </Field>

              <div className="pt-2">
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Updating password...
                    </span>
                  ) : "Reset Secure Password"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
