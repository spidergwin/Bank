"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconCircleCheck, IconCircleX, IconLoader2, IconMailCheck } from "@tabler/icons-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: { token }
        });

        if (error) {
          setStatus("error");
          setError(error.message || "Failed to verify email.");
        } else {
          setStatus("success");
          // Better Auth might auto-sign in, but we'll show success state first
        }
      } catch (err) {
        setStatus("error");
        setError("An unexpected error occurred.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-background">
        <CardContent className="p-10 text-center">
          {status === "loading" && (
            <div className="space-y-4 py-8 animate-in fade-in duration-500">
              <div className="mx-auto flex aspect-square size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4">
                <IconLoader2 className="size-10 animate-spin" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Verifying your email</h1>
              <p className="text-muted-foreground font-medium">Please wait while we confirm your account...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 py-8 animate-in zoom-in-95 duration-500">
              <div className="mx-auto flex aspect-square size-20 items-center justify-center rounded-3xl bg-green-100 text-green-600 mb-4">
                <IconCircleCheck className="size-10" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Email Verified!</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Thank you for verifying your email address. Your account is now fully active.
              </p>
              <div className="pt-6">
                <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20" render={
                  <Link href="/dashboard">Go to Dashboard</Link>
                } />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 py-8 animate-in slide-in-from-top-2 duration-500">
              <div className="mx-auto flex aspect-square size-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mb-4">
                <IconCircleX className="size-10" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Verification Failed</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {error || "We couldn't verify your email address. The link may be invalid or expired."}
              </p>
              <div className="pt-6 space-y-3">
                <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20" render={
                  <Link href="/login">Back to Sign In</Link>
                } />
                <Button variant="ghost" className="w-full h-12 rounded-xl font-bold" render={
                  <Link href="/register">Create New Account</Link>
                } />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
