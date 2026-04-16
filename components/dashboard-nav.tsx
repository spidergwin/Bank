"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  IconLayoutDashboard, 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconArrowDownLeft,
  IconHistory, 
  IconSettings,
  IconLogout
} from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const routes = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      label: "Deposit",
      href: "/deposit",
      icon: IconArrowDownLeft,
    },
    {
      label: "Transfer",
      href: "/transfer",
      icon: IconArrowUpRight,
    },
    {
      label: "Withdraw",
      href: "/withdraw",
      icon: IconArrowDownRight,
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: IconHistory,
    },
  ];

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
  }

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <SidebarMenu>
      <div className="space-y-1">
        {routes.map((route) => (
          <SidebarMenuItem key={route.href}>
            <SidebarMenuButton
              isActive={pathname === route.href}
              tooltip={route.label}
              render={<Link href={route.href} onClick={handleLinkClick} />}
              className={cn(
                "transition-all",
                pathname === route.href ? "font-bold" : "text-muted-foreground"
              )}
            >
              <route.icon />
              <span>{route.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </div>
      <div className="mt-8 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden">
          Account
        </p>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === "/settings"}
            tooltip="Settings"
            render={<Link href="/settings" onClick={handleLinkClick} />}
            className={cn(
              "transition-all",
              pathname === "/settings" ? "font-bold" : "text-muted-foreground"
            )}
          >
            <IconSettings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            tooltip="Logout"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <IconLogout />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </SidebarMenu>
  );
}
