import { Metadata } from "next";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Confirm your email address to activate your Luma Bank account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
