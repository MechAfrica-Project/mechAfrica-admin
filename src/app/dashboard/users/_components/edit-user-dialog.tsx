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
import { api } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialData: {
    name: string;
    phoneNumber: string;
    idNumber?: string;
    communityName?: string;
    type: string;
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
    farmName: "",
    farmLatitude: "",
    farmLongitude: "",
    farmSize: "",
    cropTypes: "",
    servicesOffered: "",
  });
  
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchDetails = async () => {
      if (!isOpen || !userId) return;
      
      setIsLoadingDetails(true);
      setError(null);
      
      try {
        const details = await api.getUserDetails(userId);
        if (mounted && details) {
          const user = details.user;
          const farms = details.farms || [];
          const primaryFarm = farms.length > 0 ? farms[0] : null;
          const services = details.services_offered || [];
          
          setFormData({
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            phoneNumber: user.phone_number || "",
            idNumber: user.id_number || "",
            communityName: user.community_name || "",
            farmName: primaryFarm?.farmName || "",
            farmLatitude: primaryFarm?.latitude?.toString() || "",
            farmLongitude: primaryFarm?.longitude?.toString() || "",
            farmSize: primaryFarm?.farmSize?.toString() || "",
            cropTypes: primaryFarm?.cropTypes?.join(", ") || "",
            servicesOffered: services.join(", ") || "",
          });
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch user details", err);
          // Fallback to initialData if API fails
          const parts = initialData.name ? initialData.name.split(" ") : [""];
          setFormData(prev => ({
            ...prev,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            phoneNumber: initialData.phoneNumber || "",
            idNumber: initialData.idNumber || "",
            communityName: initialData.communityName || "",
          }));
        }
      } finally {
        if (mounted) setIsLoadingDetails(false);
      }
    };

    fetchDetails();

    return () => {
      mounted = false;
    };
  }, [isOpen, userId, initialData]);

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

    if (initialData.type === "Farmer") {
      if (formData.farmName) updateData.farm_name = formData.farmName;
      if (formData.farmLatitude) updateData.farm_latitude = parseFloat(formData.farmLatitude);
      if (formData.farmLongitude) updateData.farm_longitude = parseFloat(formData.farmLongitude);
      if (formData.farmSize) updateData.farm_size = parseFloat(formData.farmSize);
      if (formData.cropTypes) updateData.crop_types = formData.cropTypes.split(",").map(s => s.trim()).filter(Boolean);
    } else if (initialData.type === "Provider") {
      if (formData.servicesOffered) updateData.services_offered = formData.servicesOffered.split(",").map(s => s.trim()).filter(Boolean);
    }

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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-[#00594C]">Edit User Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update personal information and role-specific data.
          </DialogDescription>
        </DialogHeader>

        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00594C]" />
            <p className="mt-4 text-sm text-muted-foreground">Loading full details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[#00594C] border-b pb-2 uppercase tracking-wider">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Farmer Specific Section */}
            {initialData.type === "Farmer" && (
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium text-[#00594C] border-b pb-2 uppercase tracking-wider">Farm Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      placeholder="My Farm"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (Acres)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5.5"
                      value={formData.farmSize}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmLatitude">Latitude</Label>
                    <Input
                      id="farmLatitude"
                      type="number"
                      step="any"
                      placeholder="e.g. 5.6037"
                      value={formData.farmLatitude}
                      onChange={(e) => setFormData({ ...formData, farmLatitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmLongitude">Longitude</Label>
                    <Input
                      id="farmLongitude"
                      type="number"
                      step="any"
                      placeholder="e.g. -0.1870"
                      value={formData.farmLongitude}
                      onChange={(e) => setFormData({ ...formData, farmLongitude: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropTypes">Crop Types (Comma Separated)</Label>
                  <Input
                    id="cropTypes"
                    placeholder="Maize, Cassava, Rice"
                    value={formData.cropTypes}
                    onChange={(e) => setFormData({ ...formData, cropTypes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Provider Specific Section */}
            {initialData.type === "Provider" && (
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium text-[#00594C] border-b pb-2 uppercase tracking-wider">Service Details</h4>
                <div className="space-y-2">
                  <Label htmlFor="servicesOffered">Services Offered (Comma Separated)</Label>
                  <Input
                    id="servicesOffered"
                    placeholder="Tractor Plowing, Harvesting"
                    value={formData.servicesOffered}
                    onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="w-24"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#00594C] hover:bg-[#00594cd4] w-36 shadow-md transition-all"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Saving</span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
