"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminUpdateUserRequest } from "@/lib/api/types";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialData: {
    name: string;
    phoneNumber: string;
    idNumber?: string;
    communityName?: string;
  };
  onSave: (userId: string, data: AdminUpdateUserRequest) => Promise<boolean>;
}

export function EditUserDialog({
  isOpen,
  onOpenChange,
  userId,
  initialData,
  onSave,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    idNumber: "",
    communityName: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const parts = initialData.name ? initialData.name.split(" ") : [""];
      setFormData({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        phoneNumber: initialData.phoneNumber || "",
        idNumber: initialData.idNumber || "",
        communityName: initialData.communityName || "",
      });
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const updateData: AdminUpdateUserRequest = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phoneNumber,
      id_number: formData.idNumber,
      community_name: formData.communityName,
    };

    const success = await onSave(userId, updateData);
    setIsSaving(false);
    
    if (success) {
      onOpenChange(false);
    } else {
      setError("Failed to update user details. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>
            Update the user&apos;s basic information to correct any missing or invalid data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="e.g., +233..."
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number (Ghana Card)</Label>
            <Input
              id="idNumber"
              placeholder="GHA-..."
              value={formData.idNumber}
              onChange={(e) =>
                setFormData({ ...formData, idNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">Community / Location</Label>
            <Input
              id="community"
              placeholder="Enter community"
              value={formData.communityName}
              onChange={(e) =>
                setFormData({ ...formData, communityName: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#00594C] hover:bg-[#00594cd4]"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
