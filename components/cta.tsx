import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-24 lg:py-32">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-20 text-center text-primary-foreground md:px-16 md:py-24 md:rounded-[2rem] shadow-xl shadow-primary/20">
        {/* Background elements */}
        <div className="absolute top-0 right-0 h-full w-1/3 rotate-12 scale-150 transform rounded-full bg-white/10 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 h-full w-1/3 -rotate-12 scale-150 transform rounded-full bg-black/20 blur-3xl opacity-50" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl md:mb-4">
            Join thousands of modern savers today.
          </h2>
          <p className="mb-10 text-lg font-medium opacity-90 md:text-xl lg:px-20 md:mb-8">
            Open an account in minutes and start experiencing the future of finance.
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-12 text-base font-bold shadow-lg md:h-12 md:px-10" render={
            <Link href="/register">Open Your Account Now</Link>
          } />
        </div>
      </div>
    </section>
  );
}
