"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Admin, useAdminsStore } from "@/stores/useAdminsStore";
import { Tractor, Sprout, ShieldAlert, UserCheck, Check, Sparkles } from "lucide-react";

export type NewAdminData = {
  name: string;
  email?: string;
  phoneNumber: string;
  type: string;
  avatar?: string;
  dateOfRegistration?: string;
  password?: string;
  idNumber?: string;
  idType?: string;
  communityName?: string;
  gender?: string;
};

interface AddAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAdmin?: (admin: any) => void;
}

const AVAILABLE_CROPS = [
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

const AVAILABLE_SERVICES = [
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

export function AddAdminDialog({
  isOpen,
  onOpenChange,
  onAddAdmin,
}: AddAdminDialogProps) {
  const addUser = useAdminsStore((s) => s.addUser);
  const addAdmin = useAdminsStore((s) => s.addAdmin);

  const [role, setRole] = useState<"farmer" | "service_provider" | "admin" | "agent">("farmer");

  // User Profile Basic Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    gender: "male",
    idType: "ghana_card",
    idNumber: "",
    communityName: "",
    regionName: "Ashanti",
    districtName: "Ejura",
    avatarUrl: "",
    password: "",
    confirmPassword: "",

    // Farmer specific
    farmName: "",
    farmSize: "",
    farmSizeUnit: "acres",
    mainCrop: "Maize",
    cropTypes: [] as string[],
    landOwnership: "owned",
    farmingMethod: "conventional",

    // Provider specific
    businessName: "",
    serviceCategory: "operator",
    servicesOffered: [] as string[],
    experienceYears: "2",
    hourlyRate: "",
    dailyRate: "",
    serviceRadius: "25",
    equipmentName: "",
    equipmentType: "Tractor",
    equipmentBrand: "John Deere",
    equipmentModel: "5075E",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCrop = (crop: string) => {
    setFormData((prev) => {
      const exists = prev.cropTypes.includes(crop);
      return {
        ...prev,
        cropTypes: exists
          ? prev.cropTypes.filter((c) => c !== crop)
          : [...prev.cropTypes, crop],
      };
    });
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.servicesOffered.includes(serviceId);
      return {
        ...prev,
        servicesOffered: exists
          ? prev.servicesOffered.filter((s) => s !== serviceId)
          : [...prev.servicesOffered, serviceId],
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (role === "admin") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required for admin accounts";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.password) {
        newErrors.password = "Password is required for admin accounts";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        role,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        gender: formData.gender,
        id_type: formData.idType,
        id_number: formData.idNumber.trim(),
        community_name: formData.communityName.trim(),
        region_name: formData.regionName.trim(),
        district_name: formData.districtName.trim(),
        avatar_url: formData.avatarUrl.trim() || undefined,
        password: formData.password || undefined,
      };

      if (role === "farmer") {
        payload.farm_name = formData.farmName.trim() || `${formData.firstName}'s Farm`;
        payload.farm_size = formData.farmSize ? parseFloat(formData.farmSize) : 0;
        payload.farm_size_unit = formData.farmSizeUnit;
        payload.main_crop = formData.mainCrop;
        payload.crop_types = formData.cropTypes.length > 0 ? formData.cropTypes : [formData.mainCrop];
        payload.land_ownership = formData.landOwnership;
        payload.farming_method = formData.farmingMethod;
      } else if (role === "service_provider") {
        payload.business_name = formData.businessName.trim() || `${formData.firstName} ${formData.lastName} Services`;
        payload.service_category = formData.serviceCategory;
        payload.services_offered = formData.servicesOffered;
        payload.experience_years = formData.experienceYears ? parseInt(formData.experienceYears, 10) : 1;
        payload.hourly_rate = formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0;
        payload.daily_rate = formData.dailyRate ? parseFloat(formData.dailyRate) : 0;
        payload.service_radius = formData.serviceRadius ? parseFloat(formData.serviceRadius) : 25;
        payload.equipment_name = formData.equipmentName.trim();
        payload.equipment_type = formData.equipmentType;
        payload.equipment_brand = formData.equipmentBrand.trim();
        payload.equipment_model = formData.equipmentModel.trim();
      }

      const success = await addUser(payload);

      if (success) {
        // Also call onAddAdmin if legacy handler passed
        if (onAddAdmin && role === "admin") {
          onAddAdmin({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            type: "Admin",
            dateOfRegistration: new Date().toLocaleDateString(),
          });
        }

        onOpenChange(false);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          gender: "male",
          idType: "ghana_card",
          idNumber: "",
          communityName: "",
          regionName: "Ashanti",
          districtName: "Ejura",
          avatarUrl: "",
          password: "",
          confirmPassword: "",
          farmName: "",
          farmSize: "",
          farmSizeUnit: "acres",
          mainCrop: "Maize",
          cropTypes: [],
          landOwnership: "owned",
          farmingMethod: "conventional",
          businessName: "",
          serviceCategory: "operator",
          servicesOffered: [],
          experienceYears: "2",
          hourlyRate: "",
          dailyRate: "",
          serviceRadius: "25",
          equipmentName: "",
          equipmentType: "Tractor",
          equipmentBrand: "John Deere",
          equipmentModel: "5075E",
        });
      }
    } catch (err) {
      console.error("Failed to onboard user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col border-emerald-900/20 bg-card">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Onboard New User</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Create a pre-configured Farmer, Service Provider, Agent, or Admin account
              </DialogDescription>
            </div>
          </div>

          {/* Role Picker Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-2">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                role === "farmer"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Farmer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("service_provider")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                role === "service_provider"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>Provider</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("agent")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                role === "agent"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Agent</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                role === "admin"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6 space-y-6">
            {/* SECTION 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>1. Personal & Contact Details</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. Kwame"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && <p className="text-[10px] text-destructive">{errors.firstName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. Mensah"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && <p className="text-[10px] text-destructive">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-xs font-medium">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="e.g. 0244123456"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className={errors.phoneNumber ? "border-destructive" : ""}
                  />
                  {errors.phoneNumber && <p className="text-[10px] text-destructive">{errors.phoneNumber}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email Address {role === "admin" ? "*" : "(Optional)"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. kwame@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">ID Type</Label>
                  <Select
                    value={formData.idType}
                    onValueChange={(val) => setFormData({ ...formData, idType: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ghana_card">Ghana Card</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driver_license">Driver's License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="idNumber" className="text-xs font-medium">ID Number</Label>
                  <Input
                    id="idNumber"
                    placeholder="GHA-123456789-0"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="communityName" className="text-xs font-medium">Community / Town</Label>
                  <Input
                    id="communityName"
                    placeholder="e.g. Ejura"
                    value={formData.communityName}
                    onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regionName" className="text-xs font-medium">Region</Label>
                  <Input
                    id="regionName"
                    placeholder="e.g. Ashanti"
                    value={formData.regionName}
                    onChange={(e) => setFormData({ ...formData, regionName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="districtName" className="text-xs font-medium">District</Label>
                  <Input
                    id="districtName"
                    placeholder="e.g. Ejura-Sekyedumase"
                    value={formData.districtName}
                    onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                  />
                </div>
              </div>

              {/* Password section for Admin */}
              {role === "admin" && (
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && <p className="text-[10px] text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && <p className="text-[10px] text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: FARMER SPECIFIC DETAILS */}
            {role === "farmer" && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4" />
                  <span>2. Initial Farm Details</span>
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="farmName" className="text-xs font-medium">Farm Name</Label>
                    <Input
                      id="farmName"
                      placeholder="e.g. Sunrise Farm"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="farmSize" className="text-xs font-medium">Farm Size (Acres)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      placeholder="e.g. 15"
                      value={formData.farmSize}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Crops Grown</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_CROPS.map((crop) => {
                      const selected = formData.cropTypes.includes(crop);
                      return (
                        <Badge
                          key={crop}
                          variant={selected ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selected
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Land Ownership</Label>
                    <Select
                      value={formData.landOwnership}
                      onValueChange={(val) => setFormData({ ...formData, landOwnership: val })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owned">Owned</SelectItem>
                        <SelectItem value="rented">Rented / Leased</SelectItem>
                        <SelectItem value="family_land">Family Land</SelectItem>
                        <SelectItem value="sharecropping">Sharecropping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Farming Method</Label>
                    <Select
                      value={formData.farmingMethod}
                      onValueChange={(val) => setFormData({ ...formData, farmingMethod: val })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conventional">Conventional</SelectItem>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: SERVICE PROVIDER SPECIFIC DETAILS */}
            {role === "service_provider" && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Tractor className="w-4 h-4" />
                  <span>2. Business & Service Offerings</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName" className="text-xs font-medium">Business / Enterprise Name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g. Accra Mechanization Services"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Provider Category</Label>
                    <Select
                      value={formData.serviceCategory}
                      onValueChange={(val) => setFormData({ ...formData, serviceCategory: val })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operator">Operator / Machinery Owner</SelectItem>
                        <SelectItem value="technician">Technician / Mechanic</SelectItem>
                        <SelectItem value="transport">Transporter</SelectItem>
                        <SelectItem value="contractor">General Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Services Rendered</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_SERVICES.map((serv) => {
                      const selected = formData.servicesOffered.includes(serv.id);
                      return (
                        <Badge
                          key={serv.id}
                          variant={selected ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selected
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hourlyRate" className="text-xs font-medium">Hourly Rate (GHS)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="e.g. 150"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dailyRate" className="text-xs font-medium">Daily Rate (GHS)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      placeholder="e.g. 1200"
                      value={formData.dailyRate}
                      onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="serviceRadius" className="text-xs font-medium">Service Radius (km)</Label>
                    <Input
                      id="serviceRadius"
                      type="number"
                      placeholder="25"
                      value={formData.serviceRadius}
                      onChange={(e) => setFormData({ ...formData, serviceRadius: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-3">
                  <span className="text-xs font-bold text-muted-foreground">Primary Equipment (Optional)</span>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Name (e.g. Tractor 1)"
                      value={formData.equipmentName}
                      onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Brand (e.g. John Deere)"
                      value={formData.equipmentBrand}
                      onChange={(e) => setFormData({ ...formData, equipmentBrand: e.target.value })}
                      className="text-xs"
                    />
                    <Input
                      placeholder="Model (e.g. 5075E)"
                      value={formData.equipmentModel}
                      onChange={(e) => setFormData({ ...formData, equipmentModel: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[130px]"
            >
              {isSubmitting ? "Onboarding..." : `Onboard ${role.replace("_", " ")}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
