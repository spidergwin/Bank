"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminUpdateUser,
  adminAdjustUserBalance,
  adminToggleUserLock
} from "@/server/actions";
import { toast } from "sonner";
import {
  IconPencil,
  IconLoader2,
  IconUser,
  IconWallet,
  IconLock,
  IconLockOpen,
  IconPlus,
  IconMinus,
  IconCheck
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface UserEditorProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    balance: number;
    role: string;
    isLocked: boolean;
    lockedReason: string | null;
  };
  onUpdate?: () => void;
}

export function UserEditor({ user, onUpdate }: UserEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  });

  // Balance state
  const [balanceValue, setBalanceValue] = useState((user.balance / 100).toString());
  const [adjustmentAmount, setAdjustmentAmount] = useState("");

  // Lock state
  const [lockReason, setLockedReason] = useState(user.lockedReason || "");

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const result = await adminUpdateUser(user.id, profile);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Profile updated successfully");
        onUpdate?.();
        setIsOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBalance = async () => {
    setIsLoading(true);
    try {
      const result = await adminUpdateUser(user.id, { balance: Number(balanceValue) });
      
      if (result.error) toast.error(result.error);
      else {
        toast.success("Balance updated successfully");
        onUpdate?.();
        setIsOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update balance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustBalance = async (type: 'add' | 'deduct') => {
    if (!adjustmentAmount || isNaN(Number(adjustmentAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsLoading(true);
    try {
      const amountInDollars = Number(adjustmentAmount);
      const result = await adminAdjustUserBalance(user.id, amountInDollars, type);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`Successfully ${type === 'add' ? 'added' : 'deducted'} funds`);
        onUpdate?.();
        setIsOpen(false);
      }
    } catch (err) {
      toast.error("Failed to adjust balance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLock = async () => {
    setIsLoading(true);
    try {
      const result = await adminToggleUserLock(user.id, !user.isLocked, lockReason);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`Account ${user.isLocked ? 'unlocked' : 'locked'} successfully`);
        onUpdate?.();
        setIsOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update lock status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="icon" className="rounded-xl hover:bg-accent">
          <IconPencil className="h-4 w-4" />
        </Button>
      }></DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem] overflow-hidden p-0">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold">Manage Account</DialogTitle>
          <DialogDescription className="text-base font-medium">
            Administrative controls for <strong>{user.firstName} {user.lastName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start rounded-none bg-accent/20 h-12 px-8 border-y border-accent/30">
            <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive rounded-none h-full font-bold text-xs uppercase tracking-widest">Profile</TabsTrigger>
            <TabsTrigger value="balance" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive rounded-none h-full font-bold text-xs uppercase tracking-widest">Balance</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive rounded-none h-full font-bold text-xs uppercase tracking-widest">Security</TabsTrigger>
          </TabsList>

          <div className="p-8 min-h-[300px]">
            <TabsContent value="profile" className="mt-0 space-y-6 outline-none">
              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">First Name</FieldLabel>
                    <Input
                      value={profile.firstName}
                      onChange={e => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Last Name</FieldLabel>
                    <Input
                      value={profile.lastName}
                      onChange={e => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Email Address</FieldLabel>
                  <Input
                    value={profile.email}
                    onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                  />
                </Field>
                <Field>
                  <FieldLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">System Role</FieldLabel>
                  <div className="flex gap-2 p-1 rounded-xl bg-accent/20 border border-accent/30">
                    <button
                      onClick={() => setProfile(prev => ({ ...prev, role: 'user' }))}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                        profile.role === 'user' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                      )}
                    >User</button>
                    <button
                      onClick={() => setProfile(prev => ({ ...prev, role: 'admin' }))}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                        profile.role === 'admin' ? "bg-destructive text-white shadow-lg" : "text-muted-foreground hover:bg-background/50"
                      )}
                    >Admin</button>
                  </div>
                </Field>
              </FieldGroup>
              <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 mt-4">
                {isLoading ? <IconLoader2 className="animate-spin h-5 w-5" /> : "Save Profile Changes"}
              </Button>
            </TabsContent>

            <TabsContent value="balance" className="mt-0 space-y-8 outline-none">
              <div className="space-y-4">
                <Field>
                  <FieldLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Set Absolute Balance ($)</FieldLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={balanceValue}
                        onChange={e => setBalanceValue(e.target.value)}
                        className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background pl-8 transition-all font-bold"
                      />
                    </div>
                    <Button onClick={handleSetBalance} disabled={isLoading} size="icon" className="h-12 w-12 rounded-xl">
                      <IconCheck size={20} />
                    </Button>
                  </div>
                </Field>
              </div>

              <div className="space-y-4">
                <Field>
                  <FieldLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Adjust Balance (Add/Deduct)</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={adjustmentAmount}
                      onChange={e => setAdjustmentAmount(e.target.value)}
                      className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background pl-8 transition-all font-bold"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => handleAdjustBalance('deduct')} disabled={isLoading} variant="outline" className="flex-1 h-12 rounded-xl font-bold border-red-500/20 text-red-600 hover:bg-red-50">
                      <IconMinus className="mr-2 h-4 w-4" />
                      Deduct
                    </Button>
                    <Button onClick={() => handleAdjustBalance('add')} disabled={isLoading} variant="outline" className="flex-1 h-12 rounded-xl font-bold border-green-500/20 text-green-600 hover:bg-green-50">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Add Funds
                    </Button>
                  </div>
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6 outline-none">
              <div className={cn(
                "p-6 rounded-[1.5rem] border transition-all",
                user.isLocked ? "border-red-100" : "border-green-100"
              )}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "flex aspect-square size-12 items-center justify-center rounded-2xl shadow-sm",
                    user.isLocked ? "bg-red-600 text-white" : "bg-green-600 text-white"
                  )}>
                    {user.isLocked ? <IconLock /> : <IconLockOpen />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{user.isLocked ? "Account Locked" : "Account Active"}</h4>
                    <p className="text-xs font-medium text-muted-foreground">{user.isLocked ? "User cannot perform any transactions." : "User has full access to the platform."}</p>
                  </div>
                </div>

                <Field className="mb-4">
                  <FieldLabel className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Lock/Unlock Reason</FieldLabel>
                  <Input
                    placeholder="Provide a reason for this action..."
                    value={lockReason}
                    onChange={e => setLockedReason(e.target.value)}
                    className="h-12 rounded-xl bg-background border-transparent transition-all mt-1"
                  />
                </Field>

                <Button
                  onClick={handleToggleLock}
                  disabled={isLoading}
                  variant={user.isLocked ? "default" : "destructive"}
                  className="w-full h-12 rounded-xl font-bold shadow-lg"
                >
                  {isLoading ? <IconLoader2 className="animate-spin h-5 w-5" /> : (user.isLocked ? "Unlock Account Now" : "Lock Account Immediately")}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
