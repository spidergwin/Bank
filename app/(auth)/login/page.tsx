import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Luma Bank account to manage your finances securely.",
};

export default function LoginPage() {
  return <LoginForm />;
}
