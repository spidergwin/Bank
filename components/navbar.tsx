"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";
import { IconMenu2, IconBuildingBank } from "@tabler/icons-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-foreground transition-opacity hover:opacity-90">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <IconBuildingBank className="size-5" />
          </div>
          <span>{siteConfig.name}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm font-bold text-muted-foreground/80 transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 border-l pl-8 ml-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="font-bold text-muted-foreground/80 hover:text-foreground hover:bg-transparent" nativeButton={false} render={
              <Link href="/login">Login</Link>
            } />
            <Button size="sm" className="font-bold shadow-md shadow-primary/10 px-6" nativeButton={false} render={
              <Link href="/register">Get Started</Link>
            } />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger nativeButton={true} render={
              <Button variant="ghost" size="icon" className="size-10 rounded-xl hover:bg-accent/50">
                <IconMenu2 className="h-6 w-6" />
              </Button>
            }></SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-[380px] p-0 flex flex-col border-l">
              <div className="p-6 border-b">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center justify-between gap-2 text-xl font-bold tracking-tight">
                    <div className="flex items-center gap-2">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <IconBuildingBank className="size-4" />
                      </div>
                      {siteConfig.name}
                    </div>
                    <ThemeToggle />
                  </SheetTitle>
                  <SheetDescription className="text-sm font-medium">
                    Your modern banking experience, redefined.
                  </SheetDescription>
                </SheetHeader>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Navigation</p>
                    <div className="grid gap-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="flex items-center h-12 rounded-xl px-4 text-base font-bold transition-all hover:bg-accent hover:translate-x-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-accent/5 mt-auto">
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full justify-center h-12 rounded-xl text-base font-bold bg-background shadow-sm" onClick={() => setIsOpen(false)} nativeButton={false} render={
                    <Link href="/login">Login to Account</Link>
                  } />
                  <Button className="w-full justify-center h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" onClick={() => setIsOpen(false)} nativeButton={false} render={
                    <Link href="/register">Open Free Account</Link>
                  } />
                </div>
                <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
                  Secure. Fast. Modern.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
