import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/dashboard-nav";
import { siteConfig } from "@/data/site";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { IconBuildingBank } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-svh w-full bg-background overflow-hidden">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="h-16 border-b px-2 flex justify-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" render={
                  <Link href="/" />
                }>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <IconBuildingBank className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold tracking-tight">{siteConfig.name}</span>
                    <span className="truncate text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Bank</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="p-3 overflow-y-auto">
            <DashboardNav />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t group-data-[collapsible=icon]:hidden">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Version 0.0.1
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6 transition-[width,height] ease-linear">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-[1px] bg-border hidden md:block" />
              <h1 className="text-sm font-bold md:text-base tracking-tight">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
