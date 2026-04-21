"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { IconUsers, IconSearch, IconLock, IconHistory } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { UserEditor } from "@/components/admin/user-editor";
import { UserDeleteButton } from "@/components/admin/user-delete-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  balance: number;
  role: string;
  isLocked: boolean;
  lockedReason: string | null;
  createdAt: Date;
}

export default function UserManagementClient({ users: initialUsers }: { users: User[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleUserUpdate = () => {
    // Revalidate current path to refetch users
    router.refresh();
  };

  const filteredUsers = initialUsers.filter(u =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.accountNumber.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-destructive">User Management</h2>
          <p className="text-muted-foreground font-medium text-lg">Monitor and manage all banking accounts.</p>
        </div>
        <div className="relative">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 w-full md:w-[350px] h-12 rounded-xl bg-accent/20 border-transparent focus:bg-background transition-all font-medium"
          />
        </div>
      </div>

      <Card className="border-destructive/10 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Global User Directory</CardTitle>
              <CardDescription className="text-base font-medium">
                Modify balances, view status, or manage account restrictions.
              </CardDescription>
            </div>
            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <IconUsers className="size-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <IconSearch className="h-12 w-12 mb-4" />
              <p className="text-lg font-bold uppercase tracking-widest">No users found</p>
              <p className="text-sm font-medium">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-accent/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-8 py-4 font-bold text-[10px] uppercase tracking-widest">User Details</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest">Account #</TableHead>
                      <TableHead className="py-4 font-bold text-[10px] uppercase tracking-widest text-right">Balance</TableHead>
                      <TableHead className="pr-8 py-4 font-bold text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="border-b border-accent/20 hover:bg-muted/30 transition-colors group">
                        <TableCell className="pl-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex aspect-square size-10 items-center justify-center rounded-xl font-bold text-white shadow-sm transition-transform group-hover:scale-110",
                              u.role === 'admin' ? "bg-destructive shadow-destructive/20" : "bg-primary shadow-primary/20"
                            )}>
                              {u.firstName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm tracking-tight">{u.firstName} {u.lastName}</span>
                              <span className="text-xs text-muted-foreground font-medium">{u.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.isLocked ? (
                            <Badge variant="destructive" className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight">
                              <IconLock className="size-3 mr-1" strokeWidth={3} />
                              Locked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-green-600 border-green-200 bg-green-50">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-muted-foreground">{u.accountNumber}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-sm tracking-tighter">${(u.balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </TableCell>
                        <TableCell className="pr-8 text-right space-x-2">
                          <UserEditor user={u} onUpdate={handleUserUpdate} />
                          <UserDeleteButton userId={u.id} name={`${u.firstName} ${u.lastName}`} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-6 border border-accent/30 rounded-3xl space-y-4 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex aspect-square size-10 items-center justify-center rounded-xl font-bold text-white shadow-sm",
                          u.role === 'admin' ? "bg-destructive" : "bg-primary"
                        )}>
                          {u.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{u.firstName} {u.lastName}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{u.role}</span>
                        </div>
                      </div>
                      {u.isLocked && <IconLock className="size-4 text-destructive" strokeWidth={3} />}
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-accent/20">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance</span>
                        <span className="font-bold text-lg tracking-tight">${(u.balance / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account #</span>
                        <span className="font-mono text-xs font-bold text-muted-foreground">{u.accountNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1">
                        <UserEditor user={u} onUpdate={handleUserUpdate} />
                      </div>
                      <UserDeleteButton userId={u.id} name={`${u.firstName} ${u.lastName}`} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
