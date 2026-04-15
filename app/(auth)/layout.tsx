import Link from "next/link";
import { siteConfig } from "@/data/site";
import { IconBuildingBank } from "@tabler/icons-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10 bg-background">
        <div className="flex justify-center md:justify-start mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <IconBuildingBank className="size-5" />
            </div>
            <span>{siteConfig.name}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex flex-col bg-slate-950 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-1/2 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />
        </div>
        
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-primary mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
              Secure Banking Standard
            </div>
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight leading-tight">
              Manage your wealth with <span className="text-primary">confidence.</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Experience the next generation of financial services. Built for the modern world.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 p-10 mt-auto">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500 border-t border-white/5 pt-8">
            <p>© {new Date().getFullYear()} {siteConfig.name}</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
