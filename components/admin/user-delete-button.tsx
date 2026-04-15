"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { adminDeleteUser } from "@/server/actions";
import { toast } from "sonner";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";

export function UserDeleteButton({ 
  userId, 
  name 
}: { 
  userId: string; 
  name: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    try {
      const result = await adminDeleteUser(userId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`User ${name} has been permanently removed.`);
      }
    } catch (err) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
          <IconTrash className="h-4 w-4" />
        </Button>
      }>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2rem] p-8">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-2xl font-extrabold text-destructive tracking-tight">CRITICAL: PERMANENT DELETION</AlertDialogTitle>
          <AlertDialogDescription className="text-base font-medium">
            You are about to permanently delete the user <strong>{name}</strong> and all associated data. This action is <span className="underline decoration-2 underline-offset-2">irreversible</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel disabled={isLoading} className="h-12 rounded-xl font-bold">Abort Action</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isLoading}
            className="h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold shadow-lg shadow-destructive/20 px-8"
          >
            {isLoading ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : "YES, DELETE USER"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
