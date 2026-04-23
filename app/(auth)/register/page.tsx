import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Luma Bank today and start managing your finances with our modern fintech platform.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
