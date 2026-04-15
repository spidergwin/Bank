import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { siteConfig } from "@/data/site";
import Link from "next/link";
import { 
  IconUsers, 
  IconChartBar, 
  IconHistory, 
  IconShieldLock,
  IconArrowLeft,
  IconBuildingBank
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full bg-background overflow-hidden">
        <Sidebar collapsible="icon" className="border-r border-destructive/20">
          <SidebarHeader className="h-16 border-b px-2 flex justify-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" render={
                  <Link href="/admin" />
                }>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                    <IconShieldLock className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold tracking-tight">Admin Portal</span>
                    <span className="truncate text-[10px] text-destructive uppercase tracking-widest font-bold">Secure Access</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="p-3 overflow-y-auto">
            <SidebarMenu>
              <div className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Overview" render={<Link href="/admin" />}>
                    <IconChartBar />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Users" render={<Link href="/admin/users" />}>
                    <IconUsers />
                    <span>User Management</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Transactions" render={<Link href="/admin/transactions" />}>
                    <IconHistory />
                    <span>All Transactions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
              
              <div className="mt-8 space-y-1">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden">
                  System
                </p>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Exit Admin" render={<Link href="/dashboard" />} className="text-muted-foreground">
                    <IconArrowLeft />
                    <span>Back to Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t group-data-[collapsible=icon]:hidden">
            <div className="text-[10px] text-destructive font-bold uppercase tracking-widest">
              Restricted Area
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6 transition-[width,height] ease-linear bg-destructive/5">
             <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-[1px] bg-border hidden md:block" />
              <h1 className="text-sm font-bold md:text-base text-destructive tracking-tight uppercase">Admin Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/5">
            <div className="mx-auto max-w-6xl space-y-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
