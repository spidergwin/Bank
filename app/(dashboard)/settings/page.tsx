"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { 
  IconUser, 
  IconLock, 
  IconShieldCheck, 
  IconLoader2, 
  IconCircleCheck, 
  IconCopy, 
  IconEye, 
  IconEyeOff, 
  IconCheck 
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newImage, setNewImage] = useState("");

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPasswordValue = passwordForm.watch("newPassword");

  const passwordRequirements = [
    { label: "At least 8 characters", met: newPasswordValue.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPasswordValue) },
    { label: "One number", met: /[0-9]/.test(newPasswordValue) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(newPasswordValue) },
  ];

  useEffect(() => {
    if (session?.user) {
      setNewFirstName(session.user.firstName || "");
      setNewLastName(session.user.lastName || "");
      setNewImage(session.user.image || "");
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { error } = await authClient.updateUser({
        firstName: newFirstName,
        lastName: newLastName,
        image: newImage || undefined,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password updated successfully");
        passwordForm.reset();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const copyAccountNumber = () => {
    if (session?.user?.accountNumber) {
      navigator.clipboard.writeText(session.user.accountNumber);
      toast.success("Account number copied to clipboard");
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Settings</h2>
        <p className="text-muted-foreground font-medium text-lg">Manage your account preferences and security.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-accent/20 p-1 rounded-xl h-12 w-full justify-start md:w-auto border border-accent/30">
          <TabsTrigger value="profile" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <IconUser className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <IconLock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <IconShieldCheck className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 outline-none">
          <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
              <CardDescription className="text-base font-medium">Update your profile details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <FieldGroup className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-accent/10 border border-accent/20">
                    <Avatar className="h-24 w-24 rounded-2xl border-2 border-primary/20">
                      <AvatarImage src={newImage} />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {`${newFirstName?.charAt(0) || ""}${newLastName?.charAt(0) || ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4 w-full">
                      <Field>
                        <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Profile Picture URL</FieldLabel>
                        <Input 
                          value={newImage} 
                          onChange={(e) => setNewImage(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="h-12 rounded-xl bg-background border-accent/50 focus:border-primary transition-all"
                        />
                        <p className="text-[10px] font-medium text-muted-foreground mt-2 uppercase tracking-tight">Paste a direct link to an image (JPEG, PNG, WebP)</p>
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">First Name</FieldLabel>
                      <Input 
                        value={newFirstName} 
                        onChange={(e) => setNewFirstName(e.target.value)}
                        placeholder="John"
                        className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Last Name</FieldLabel>
                      <Input 
                        value={newLastName} 
                        onChange={(e) => setNewLastName(e.target.value)}
                        placeholder="Doe"
                        className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background transition-all"
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email Address</FieldLabel>
                    <Input 
                      value={session?.user?.email || ""} 
                      disabled 
                      className="h-12 rounded-xl bg-accent/10 border-transparent cursor-not-allowed opacity-70"
                    />
                    <p className="text-xs font-medium text-muted-foreground mt-2">Email address cannot be changed for security reasons.</p>
                  </Field>
                </FieldGroup>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating} className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                    {isUpdating ? <IconLoader2 className="h-4 w-4 animate-spin mr-2" /> : <IconCircleCheck className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 outline-none">
          <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold">Security Settings</CardTitle>
              <CardDescription className="text-base font-medium">Manage your password and two-factor authentication.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground font-medium">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" className="h-11 rounded-xl font-bold border-primary/20 hover:bg-primary/5 text-primary">
                  Enable 2FA
                </Button>
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="space-y-6">
                <h4 className="font-bold text-lg">Change Password</h4>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                  <FieldGroup className="space-y-4">
                    <Field>
                      <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Current Password</FieldLabel>
                      <div className="relative">
                        <Input 
                          type={showPasswords.current ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background pr-12 transition-all" 
                          {...passwordForm.register("currentPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.current ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-destructive text-xs font-medium mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </Field>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field>
                        <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">New Password</FieldLabel>
                        <div className="relative">
                          <Input 
                            type={showPasswords.new ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background pr-12 transition-all" 
                            {...passwordForm.register("newPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.new ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                          </button>
                        </div>
                      </Field>
                      <Field>
                        <FieldLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Confirm New Password</FieldLabel>
                        <div className="relative">
                          <Input 
                            type={showPasswords.confirm ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="h-12 rounded-xl bg-accent/30 border-transparent focus:bg-background pr-12 transition-all" 
                            {...passwordForm.register("confirmPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.confirm ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-destructive text-xs font-medium mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </Field>
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 p-4 rounded-xl bg-accent/20 border border-accent/30">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={cn(
                            "flex aspect-square size-4 items-center justify-center rounded-full border transition-colors",
                            req.met ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30 text-transparent"
                          )}>
                            <IconCheck size={10} strokeWidth={4} />
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-tight transition-colors",
                            req.met ? "text-foreground" : "text-muted-foreground"
                          )}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </FieldGroup>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isChangingPassword} className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                      {isChangingPassword ? <IconLoader2 className="h-4 w-4 animate-spin mr-2" /> : <IconCircleCheck className="h-4 w-4 mr-2" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6 outline-none">
           <Card className="border-border/50 shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold text-destructive">Advanced Account Settings</CardTitle>
              <CardDescription className="text-base font-medium">Manage sensitive account data and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="space-y-4">
                <h4 className="font-bold text-lg">Account Number</h4>
                <div className="flex items-center gap-3">
                   <div className="h-12 flex-1 rounded-xl bg-accent/20 border border-accent/30 flex items-center px-4 font-mono font-bold text-lg">
                    {session?.user?.accountNumber || "N/A"}
                  </div>
                  <Button variant="outline" size="icon" onClick={copyAccountNumber} className="size-12 rounded-xl border-accent/30 hover:bg-accent/10">
                    <IconCopy className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-xs font-medium text-muted-foreground">Use this number for incoming transfers. Never share your password.</p>
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground font-medium max-w-lg">
                  Once you delete your account, there is no going back. All your balance will be forfeited and your transaction history will be purged.
                </p>
                <Button variant="destructive" className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-destructive/20">
                  Request Account Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
