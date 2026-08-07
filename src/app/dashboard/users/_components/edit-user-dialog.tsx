"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminUpdateUserRequest, AdminFarmDetail } from "@/lib/api/types";
import { api } from "@/lib/api/client";
import { useCatalogStore } from "@/stores/useCatalogStore";
import { useLocationStore } from "@/stores/useLocationStore";
import { AdminTypeBadge } from "./admin-type-badge";
import {
  Pencil,
  Loader2,
  Sprout,
  Tractor,
  Check,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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

const DEFAULT_FALLBACK_CROPS = [
  "Maize",
  "Cassava",
  "Rice",
  "Yam",
  "Soybeans",
  "Tomatoes",
  "Pepper",
  "Cowpea",
  "Sorghum",
  "Groundnuts",
];

const DEFAULT_FALLBACK_SERVICES = [
  { id: "ploughing", label: "Ploughing" },
  { id: "planting", label: "Planting" },
  { id: "spraying", label: "Spraying" },
  { id: "harvesting", label: "Harvesting" },
  { id: "harrowing", label: "Harrowing" },
  { id: "threshing", label: "Threshing" },
  { id: "bagging", label: "Bagging" },
  { id: "fertilization", label: "Fertilization" },
  { id: "transport", label: "Transport" },
  { id: "ripping", label: "Ripping" },
  { id: "drone", label: "Drone Spraying" },
];

export function EditUserDialog({
  isOpen,
  onOpenChange,
  userId,
  initialData,
  onSave,
}: EditUserDialogProps) {
  // Catalog Store
  const storeCrops = useCatalogStore((s) => s.crops);
  const storeServices = useCatalogStore((s) => s.services);
  const fetchCrops = useCatalogStore((s) => s.fetchCrops);
  const fetchServices = useCatalogStore((s) => s.fetchServices);

  // Location Store
  const regions = useLocationStore((s) => s.regions);
  const isLoadingLocations = useLocationStore((s) => s.isLoading);
  const fetchLocations = useLocationStore((s) => s.fetchLocations);

  // Location selection state (IDs)
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  // Derived cascading data
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const availableDistricts = selectedRegion?.districts || [];

  useEffect(() => {
    if (isOpen) {
      fetchCrops();
      fetchServices();
      fetchLocations();
    }
  }, [isOpen, fetchCrops, fetchServices, fetchLocations]);

  const availableCrops =
    storeCrops.length > 0
      ? storeCrops.map((c) => c.name)
      : DEFAULT_FALLBACK_CROPS;

  const availableServices =
    storeServices.length > 0
      ? storeServices.map((s) => ({
          id: s.name.toLowerCase().replace(/\s+/g, "_"),
          label: s.name,
        }))
      : DEFAULT_FALLBACK_SERVICES;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    idNumber: "",
    communityName: "",
    regionName: "Ashanti",
    districtName: "Ejura",
    // Farmer specific
    farmName: "",
    farmLatitude: "",
    farmLongitude: "",
    farmSize: "",
    cropTypesList: [] as string[],
    mainCrop: "Maize",
    landOwnership: "owned",
    farmingMethod: "conventional",
    // Provider specific
    businessName: "",
    serviceCategory: "operator",
    servicesOfferedList: [] as string[],
    hourlyRate: "",
    dailyRate: "",
    serviceRadius: "25",
    equipmentName: "",
    equipmentBrand: "",
    equipmentModel: "",
  });

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [farmsList, setFarmsList] = useState<AdminFarmDetail[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(undefined);

  // Infer user role
  const isFarmer = initialData.type === "Farmer";
  const isProvider = initialData.type === "Provider";

  useEffect(() => {
    let mounted = true;

    const fetchDetails = async () => {
      if (!isOpen || !userId) return;

      setIsLoadingDetails(true);

      try {
        const details = await api.getUserDetails(userId);
        if (mounted && details) {
          const user = details.user;
          const farms = details.farms || [];
          const primaryFarm = farms.length > 0 ? farms[0] : null;
          const services = details.services_offered || [];

          setFarmsList(farms);
          if (primaryFarm) setSelectedFarmId(primaryFarm.id);

          const userRegionName = details.region_name || user.region_name || "";
          const userDistrictName = details.district_name || user.district_name || "";

          setFormData({
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            phoneNumber: user.phone_number || "",
            idNumber: user.id_number || "",
            communityName: details.community_name || user.community_name || user.street_address || initialData.communityName || "",
            regionName: userRegionName,
            districtName: userDistrictName,
            farmName: primaryFarm?.farmName || "",
            farmLatitude: primaryFarm?.latitude?.toString() || "",
            farmLongitude: primaryFarm?.longitude?.toString() || "",
            farmSize: primaryFarm?.farmSize?.toString() || "",
            cropTypesList: primaryFarm?.cropTypes || [],
            mainCrop: primaryFarm?.mainCrop || "Maize",
            landOwnership: primaryFarm?.landOwnership || "owned",
            farmingMethod: primaryFarm?.farmingMethod || "conventional",
            businessName: "",
            serviceCategory: "operator",
            servicesOfferedList: services,
            hourlyRate: "",
            dailyRate: "",
            serviceRadius: "25",
            equipmentName: details.equipment && details.equipment.length > 0 ? (details.equipment[0].name || "") : "",
            equipmentBrand: details.equipment && details.equipment.length > 0 ? (details.equipment[0].brand || "") : "",
            equipmentModel: details.equipment && details.equipment.length > 0 ? (details.equipment[0].model || "") : "",
          });

          // Auto-match existing region/district names to their IDs
          // This runs after locations are fetched from the store
          const matchedRegion = regions.find(
            (r) => r.name.toLowerCase() === userRegionName.toLowerCase()
          );
          if (matchedRegion) {
            setSelectedRegionId(matchedRegion.id);
            const matchedDistrict = matchedRegion.districts.find(
              (d) => d.name.toLowerCase() === userDistrictName.toLowerCase()
            );
            if (matchedDistrict) {
              setSelectedDistrictId(matchedDistrict.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user details for editing:", err);
      } finally {
        if (mounted) setIsLoadingDetails(false);
      }
    };

    fetchDetails();

    return () => {
      mounted = false;
    };
  }, [isOpen, userId, initialData.communityName, regions]);

  // Real-time Field Validations
  const isFirstNameValid = formData.firstName.trim().length > 0;
  const isLastNameValid = formData.lastName.trim().length > 0;
  const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, "");
  const isPhoneValid = cleanPhone.length >= 9 && /^[0-9+]+$/.test(cleanPhone);

  const isFormValid = isFirstNameValid && isLastNameValid && isPhoneValid;

  const getValidationHint = () => {
    if (!isFirstNameValid || !isLastNameValid) {
      return { msg: "First & Last name required", valid: false };
    }
    if (!isPhoneValid) {
      return { msg: "Valid phone number required (min. 9 digits)", valid: false };
    }
    return { msg: "All fields valid", valid: true };
  };

  const validationHint = getValidationHint();

  const toggleCrop = (crop: string) => {
    setFormData((prev) => {
      const exists = prev.cropTypesList.includes(crop);
      return {
        ...prev,
        cropTypesList: exists
          ? prev.cropTypesList.filter((c) => c !== crop)
          : [...prev.cropTypesList, crop],
      };
    });
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.servicesOfferedList.includes(serviceId);
      return {
        ...prev,
        servicesOfferedList: exists
          ? prev.servicesOfferedList.filter((s) => s !== serviceId)
          : [...prev.servicesOfferedList, serviceId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSaving(true);

    try {
      const updateData: AdminUpdateUserRequest = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phoneNumber.trim(),
        id_number: formData.idNumber.trim(),
        community_name: formData.communityName.trim(),
        region_name: formData.regionName.trim(),
        district_name: formData.districtName.trim(),
      };

      if (isFarmer) {
        if (selectedFarmId) {
          updateData.farm_id = selectedFarmId;
        }
        if (formData.farmName) {
          updateData.farm_name = formData.farmName.trim();
        }
        if (formData.farmSize) {
          updateData.farm_size = parseFloat(formData.farmSize);
        }
        if (formData.farmLatitude && !isNaN(parseFloat(formData.farmLatitude))) {
          updateData.farm_latitude = parseFloat(formData.farmLatitude);
        }
        if (formData.farmLongitude && !isNaN(parseFloat(formData.farmLongitude))) {
          updateData.farm_longitude = parseFloat(formData.farmLongitude);
        }
        if (formData.cropTypesList.length > 0) {
          updateData.crop_types = formData.cropTypesList;
        }
        if (formData.mainCrop) {
          updateData.main_crop = formData.mainCrop;
        }
      } else if (isProvider) {
        if (formData.servicesOfferedList.length > 0) {
          updateData.services_offered = formData.servicesOfferedList;
        }
      }

      const success = await onSave(userId, updateData);
      if (success) {
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col border-emerald-900/20 bg-card shadow-2xl">
        {/* Header (Fixed Top) */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">Edit User Profile</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update credentials, contact info, and role-specific agricultural data
                </DialogDescription>
              </div>
            </div>
            <div className="pr-4">
              <AdminTypeBadge type={initialData.type || "User"} />
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs text-muted-foreground font-medium">Fetching user details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {/* SECTION 1: Personal & Contact Credentials */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span>1. Basic Personal & Contact Details</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="editFirstName" className="text-xs font-medium">First Name *</Label>
                    <Input
                      id="editFirstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={!isFirstNameValid ? "border-destructive" : ""}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="editLastName" className="text-xs font-medium">Last Name *</Label>
                    <Input
                      id="editLastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={!isLastNameValid ? "border-destructive" : ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="editPhoneNumber" className="text-xs font-medium">Phone Number *</Label>
                    <Input
                      id="editPhoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className={!isPhoneValid ? "border-destructive" : ""}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="editIdNumber" className="text-xs font-medium">ID Number</Label>
                    <Input
                      id="editIdNumber"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Region</Label>
                    <Select
                      value={selectedRegionId}
                      onValueChange={(val) => {
                        setSelectedRegionId(val);
                        setSelectedDistrictId("");
                        const region = regions.find((r) => r.id === val);
                        setFormData((prev) => ({
                          ...prev,
                          regionName: region?.name || "",
                          districtName: "",
                        }));
                      }}
                      disabled={isLoadingLocations}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingLocations ? "Loading..." : "Select Region"} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">District</Label>
                    <Select
                      value={selectedDistrictId}
                      onValueChange={(val) => {
                        setSelectedDistrictId(val);
                        const district = availableDistricts.find((d) => d.id === val);
                        setFormData((prev) => ({
                          ...prev,
                          districtName: district?.name || "",
                        }));
                      }}
                      disabled={!selectedRegionId || availableDistricts.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="editCommunity" className="text-xs font-medium">Community / Town</Label>
                    <Input
                      id="editCommunity"
                      value={formData.communityName}
                      onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: FARMER SPECIFIC DETAILS */}
              {isFarmer && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sprout className="w-4 h-4" />
                    <span>2. Farm & Agricultural Settings</span>
                  </h3>

                  {farmsList.length > 1 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Select Farm to Update</Label>
                      <Select
                        value={selectedFarmId}
                        onValueChange={(val) => {
                          setSelectedFarmId(val);
                          const target = farmsList.find((f) => f.id === val);
                          if (target) {
                            setFormData((prev) => ({
                              ...prev,
                              farmName: target.farmName || "",
                              farmSize: target.farmSize?.toString() || "",
                              cropTypesList: target.cropTypes || [],
                              mainCrop: target.mainCrop || "Maize",
                            }));
                          }
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {farmsList.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.farmName} ({f.farmSize} acres)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="editFarmName" className="text-xs font-medium">Farm Name</Label>
                      <Input
                        id="editFarmName"
                        value={formData.farmName}
                        onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="editFarmSize" className="text-xs font-medium">Farm Size (Acres)</Label>
                      <Input
                        id="editFarmSize"
                        type="number"
                        value={formData.farmSize}
                        onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Crops Grown</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCrops.map((crop) => {
                        const selected = formData.cropTypesList.includes(crop);
                        return (
                          <Badge
                            key={crop}
                            variant={selected ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              selected
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                : "hover:border-emerald-500"
                            }`}
                            onClick={() => toggleCrop(crop)}
                          >
                            {crop} {selected && <Check className="w-3 h-3 ml-1 inline" />}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: SERVICE PROVIDER SPECIFIC DETAILS */}
              {isProvider && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Tractor className="w-4 h-4" />
                    <span>2. Services Rendered & Mechanization</span>
                  </h3>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Services Offered</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableServices.map((serv) => {
                        const selected = formData.servicesOfferedList.includes(serv.id);
                        return (
                          <Badge
                            key={serv.id}
                            variant={selected ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              selected
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                : "hover:border-emerald-500"
                            }`}
                            onClick={() => toggleService(serv.id)}
                          >
                            {serv.label} {selected && <Check className="w-3 h-3 ml-1 inline" />}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer Bar */}
            <div className="p-4 border-t border-border bg-muted/30 flex-shrink-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {validationHint.valid ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 text-[11px] py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{validationHint.msg}</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-[11px] py-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationHint.msg}</span>
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSaving}
                  className={
                    isFormValid && !isSaving
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 cursor-pointer min-w-[130px] transition-all"
                      : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-60 min-w-[130px]"
                  }
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
