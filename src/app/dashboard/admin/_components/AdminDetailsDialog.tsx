"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: string;
  phoneNumber: string;
  dateOfRegistration: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  admin: Admin | null;
}

export default function AdminDetailsDialog({ open, onOpenChange, admin }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Details</DialogTitle>
          <DialogDescription>Full details for the selected admin.</DialogDescription>
        </DialogHeader>

        {admin ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{admin.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{admin.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{admin.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{admin.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of registration</p>
              <p className="font-medium">{admin.dateOfRegistration}</p>
            </div>
          </div>
        ) : (
          <div className="mt-4">No details available.</div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
