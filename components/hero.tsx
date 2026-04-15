import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-20 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[50%] w-[100%] bg-gradient-to-t from-background to-transparent opacity-40" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            Trusted by over 1M+ users worldwide
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="block dark:text-gradient text-gradient-dark leading-tight md:leading-[1.1]">
              {siteConfig.hero.title}
            </span>
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-muted-foreground md:text-xl md:mb-8 lg:px-24">
            {siteConfig.hero.subtitle}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 px-10 text-base font-bold shadow-lg shadow-primary/20 md:h-12 md:px-8" render={
              <Link href="/register">{siteConfig.hero.cta}</Link>
            } />
            <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold md:h-12 md:px-8" render={
              <Link href="#features">{siteConfig.hero.secondaryCta}</Link>
            } />
          </div>
        </div>
      </div>
    </section>
  );
}
