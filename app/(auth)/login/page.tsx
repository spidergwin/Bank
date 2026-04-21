"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { IconEye, IconEyeOff, IconLoader2, IconBuildingBank, IconAlertCircle, IconMailForward } from "@tabler/icons-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setFormError(null);
    setUnverified(false);
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.code === "EMAIL_NOT_VERIFIED" || error.status === 403) {
          setUnverified(true);
          setFormError("Your email address has not been verified yet.");
        } else {
          setFormError(error.message || "Invalid email or password. Please try again.");
        }
        toast.error("Sign in failed");
      } else {
        toast.success("Welcome back! Redirecting...");
        // Redirect based on role
        const session = await authClient.getSession();
        if (session?.data?.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("Sign-in catch error:", err);
      setFormError("An unexpected error occurred. Please check your connection.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const email = form.getValues("email");
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error(error.message || "Failed to resend verification email");
      } else {
        toast.success("Verification email resent! Please check your inbox.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <Link href="/" className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-2">
            <IconBuildingBank className="size-6" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground font-medium">
            Securely access your banking dashboard
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            {formError && (
              <div className="mb-6 flex flex-col gap-3 rounded-xl bg-destructive/10 p-4 text-sm font-bold text-destructive animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <IconAlertCircle className="size-5 shrink-0" />
                  <p>{formError}</p>
                </div>
                {unverified && (
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-destructive font-black uppercase tracking-widest text-[10px] h-auto p-0 w-fit underline decoration-2 underline-offset-4"
                    onClick={handleResendVerification}
                    disabled={resending}
                  >
                    {resending ? "Resending..." : "Resend Verification Link"}
                  </Button>
                )}
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
                <Field>
                  <div className="flex items-center justify-between mb-1">
                    <FieldLabel htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
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
                  {form.formState.errors.password && (
                    <p className="text-destructive text-xs font-medium mt-1">{form.formState.errors.password.message}</p>
                  )}
                </Field>
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </span>
                  ) : "Sign In to Account"}
                </Button>
                <p className="text-center text-sm font-medium text-muted-foreground pt-2">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary font-bold hover:underline">
                    Create one
                  </Link>
                </p>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
