"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contact } from "@/types/types";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // We only collect a subset of fields in the UI. Accept a partial contact and
  // let the parent page fill in missing required fields with sensible defaults.
  onAdd: (contact: Partial<Omit<Contact, "id">>) => void;
}

export default function AddContactDialog({
  open,
  onOpenChange,
  onAdd,
}: AddContactDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    type: "Farmer" as Contact["type"],
    phone: "",
    registrationDate: new Date().toISOString().split("T")[0],
    initials: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.initials = value
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      onAdd(formData);
      setFormData({
        name: "",
        username: "",
        type: "Farmer",
        phone: "",
        registrationDate: new Date().toISOString().split("T")[0],
        initials: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new contact.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as Contact["type"],
                }))
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Farmer">Farmer</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
                <SelectItem value="Provider">Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Registration Date</Label>
            <Input
              id="date"
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Contact</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
