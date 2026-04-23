import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Modern Banking for Everyone",
  description: "Experience the future of banking with Luma Bank. Secure, fast, and intuitive fintech solutions for your daily needs.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background selection:bg-primary/10">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
