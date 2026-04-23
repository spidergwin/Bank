"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { IconUser, IconSettings, IconLogout, IconCopy, IconCheck, IconCreditCard } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

export function UserNav() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [copied, setCopied] = useState(false);

  if (!session) return null;

  const user = session.user;
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || user.name?.charAt(0).toUpperCase();

  const handleCopyDetails = async () => {
    const details = `Name: ${user.firstName} ${user.lastName}\nAccount Number: ${user.accountNumber}`;
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      toast.success("Details copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy details");
    }
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" className="relative h-10 w-10 rounded-xl">
          <Avatar className="h-10 w-10 rounded-xl border border-border/50">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      } />
      <DropdownMenuContent className="w-64 mt-2 rounded-2xl border-border/50 shadow-2xl p-2" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none">{user.firstName} {user.lastName}</p>
              <p className="text-xs leading-none text-muted-foreground font-medium">{user.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem 
            className="rounded-xl p-3 cursor-pointer focus:bg-accent flex items-center justify-between"
            onClick={handleCopyDetails}
          >
            <div className="flex items-center">
              <IconCopy className="mr-3 h-4 w-4" />
              <span className="font-medium text-sm">Copy Details</span>
            </div>
            {copied && <IconCheck className="h-4 w-4 text-green-500" />}
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl p-3 cursor-pointer focus:bg-accent" onClick={() => router.push("/settings")}>
            <IconSettings className="mr-3 h-4 w-4" />
            <span className="font-medium text-sm">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem className="rounded-xl p-3 cursor-pointer focus:bg-destructive/10 text-destructive focus:text-destructive" onClick={handleLogout}>
          <IconLogout className="mr-3 h-4 w-4" />
          <span className="font-bold text-sm">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
