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
import { RequestItem } from "./mockRequests";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: RequestItem | null;
}

export default function RequestDetailsDialog({ open, onOpenChange, row }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>Full details for the selected request.</DialogDescription>
        </DialogHeader>

        {row ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{row.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Handle</p>
              <p className="font-medium">{row.handle}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{row.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{row.status}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{row.date}</p>
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
