"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { generateAccountNumber } from "@/lib/utils";
import { IconEye, IconEyeOff, IconLoader2, IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
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
    setIsLoading(true);
    setFormError(null);
    console.log("Submitting register form...", values.email);
    try {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        accountNumber: generateAccountNumber(),
        balance: 100000, // Starting bonus for new users
      });

      console.log("Sign-up response:", { data, error });

      if (error) {
        setFormError(error.message || "Failed to create account. Please try again.");
        toast.error("Account creation failed");
      } else {
        toast.success("Account created successfully! Welcome to Luma Bank.");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Sign-up catch error:", err);
      setFormError("An unexpected error occurred. Please check your connection.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2 mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground font-medium">Join thousands of modern savers today</p>
      </div>

      <Card className="w-full border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-background">
        <CardContent className="p-8 md:p-10">
          {formError && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-sm font-bold text-destructive animate-in fade-in zoom-in-95 duration-200">
              <IconAlertCircle className="size-5 shrink-0" />
              <p>{formError}</p>
            </div>
          )}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Full Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                  {...form.register("name")}
                  required
                />
                {form.formState.errors.name && (
                  <p className="text-destructive text-xs font-medium mt-1">{form.formState.errors.name.message}</p>
                )}
              </Field>
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
                <FieldLabel htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Password</FieldLabel>
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                  </button>
                </div>
                
                {/* Password Requirements Checklist */}
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
              
              <div className="pt-2">
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : "Create Secure Account"}
                </Button>
              </div>
              
              <p className="text-center text-sm font-medium text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign in instead
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium max-w-xs leading-loose">
        By continuing, you agree to our Terms of Service and Privacy Policy. All transactions are encrypted.
      </p>
    </div>
  );
}
