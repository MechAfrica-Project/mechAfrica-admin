"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Contact, Farmer, Provider, Agent } from "@/types/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface EditContactDialogProps {
  contact: Contact;
  onOpenChange: (open: boolean) => void;
  onUpdate: (contact: Contact) => void;
}

export default function EditContactDialog({
  contact,
  onOpenChange,
  onUpdate,
}: EditContactDialogProps) {
  const [formData, setFormData] = useState(contact);

  useEffect(() => {
    setFormData(contact);
  }, [contact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.phone) {
      onUpdate(formData);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {formData.type} Profile</DialogTitle>
          <DialogDescription>
            Update the contact information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-teal-600 text-white font-semibold text-xl">
                {formData.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Edit {formData.type}</h3>
              <p className="text-sm text-muted-foreground">
                {formData.firstName}&apos;s Profile
              </p>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherNames">Other names</Label>
              <Input
                id="otherNames"
                name="otherNames"
                value={formData.otherNames}
                onChange={handleInputChange}
                placeholder="Enter other names"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "Male" | "Female") =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telephone number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+233 22 85 79 95"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={formData.region}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, region: value }))
                }
              >
                <SelectTrigger id="region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ashanti Region">Ashanti Region</SelectItem>
                  <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                  <SelectItem value="Western Region">Western Region</SelectItem>
                  <SelectItem value="Central Region">Central Region</SelectItem>
                  <SelectItem value="Eastern Region">Eastern Region</SelectItem>
                  <SelectItem value="Northern Region">
                    Northern Region
                  </SelectItem>
                  <SelectItem value="Volta Region">Volta Region</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="District Name"
              />
            </div>
          </div>

          {formData.type === "Farmer" && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">Farm Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    name="farmName"
                    value={(formData as Farmer).farmName}
                    onChange={handleInputChange}
                    placeholder="ie. Kwame Mintah Farms"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size</Label>
                  <div className="flex gap-2">
                    <Input
                      id="farmSize"
                      name="farmSize"
                      type="number"
                      value={(formData as Farmer).farmSize}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="flex-1"
                    />
                    <span className="flex items-center px-3">Acre</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Crops</Label>
                <div className="flex gap-4">
                  {["Maize", "Wheat", "Rice", "Cassava"].map((crop) => (
                    <label key={crop} className="flex items-center gap-2">
                      <Checkbox
                        checked={(formData as Farmer).crops.includes(crop as Farmer["crops"][number])}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => {
                            const farmer = prev as Farmer;
                            const crops = checked
                              ? [...farmer.crops, crop as Farmer["crops"][number]]
                              : farmer.crops.filter((c) => c !== crop);
                            return { ...prev, crops };
                          });
                        }}
                      />
                      <span className="text-sm">{crop}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="formLocation">Form Location</Label>
                <Input
                  id="formLocation"
                  name="formLocation"
                  value={(formData as Farmer).formLocation}
                  onChange={handleInputChange}
                  placeholder="Long + Lat info"
                />
              </div>
            </div>
          )}

          {formData.type === "Provider" && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">Services</h4>
              <div className="space-y-2">
                <Label>Services Provided</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Farming Supplies",
                    "Pesticides",
                    "Fertilizers",
                    "Equipment Rental",
                    "Transportation",
                    "Storage",
                  ].map((service) => (
                    <label key={service} className="flex items-center gap-2">
                      <Checkbox
                        checked={(formData as Provider).services.includes(
                          service
                        )}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => {
                            const provider = prev as Provider;
                            const services = checked
                              ? [...provider.services, service]
                              : provider.services.filter((s) => s !== service);
                            return { ...prev, services };
                          });
                        }}
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formData.type === "Agent" && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">Assignment</h4>
              <div className="space-y-2">
                <Label htmlFor="assignedRegion">Assigned Region</Label>
                <Input
                  id="assignedRegion"
                  name="assignedRegion"
                  value={(formData as Agent).assignedRegion}
                  onChange={handleInputChange}
                  placeholder="Enter assigned region"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              Update Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
