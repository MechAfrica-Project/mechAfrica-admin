"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { AdminFarmDetail, AdminEquipmentDetail } from "@/lib/api/types";
import { AdminTypeBadge } from "./admin-type-badge";
import {
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Wheat,
  Navigation,
  Wrench,
  Loader2,
  Layers,
  CheckCircle2,
  Mail,
  Tractor,
  Sprout,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: string;
  phoneNumber: string;
  dateOfRegistration: string;
  idNumber?: string;
  communityName?: string;
  accountCreatedVia?: string;
}

interface UserExtras {
  farms: AdminFarmDetail[];
  servicesOffered: string[];
  equipment: AdminEquipmentDetail[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: AdminUser | null;
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 transition-all hover:bg-muted/50">
      <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
          {label}
        </p>
        <div className="text-xs font-semibold text-foreground truncate">
          {value || <span className="text-muted-foreground font-normal">—</span>}
        </div>
      </div>
    </div>
  );
}

export default function AdminDetailsDialog({ open, onOpenChange, user }: Props) {
  const [extras, setExtras] = useState<UserExtras | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!open || !user) return;
      setIsLoading(true);
      setExtras(null);
      try {
        const resp = await api.getUserDetails(user.id);
        if (active && resp) {
          setExtras({
            farms: (resp.farms || []) as AdminFarmDetail[],
            servicesOffered: resp.services_offered || [],
            equipment: resp.equipment || [],
          });
        }
      } catch {
        // Silent – still show basic info
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [open, user]);

  const isFarmer = user?.type === "Farmer";
  const isProvider = user?.type === "Provider";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col border-emerald-900/20 bg-card shadow-2xl">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 px-6 py-6 text-white border-b border-emerald-900/30 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-emerald-400/30 shadow-xl ring-2 ring-emerald-500/20">
                  <AvatarFallback className="bg-emerald-800 text-white text-xl font-bold">
                    {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-bold text-white tracking-tight">
                      {user?.name || "User Details"}
                    </DialogTitle>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] py-0.5 gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Verified User</span>
                    </Badge>
                  </div>
                  <DialogDescription className="text-emerald-200/80 text-xs mt-1 flex items-center gap-3">
                    {user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-400" />
                        <span>{user.email}</span>
                      </span>
                    )}
                    {user?.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{user.phoneNumber}</span>
                      </span>
                    )}
                  </DialogDescription>
                  <div className="flex items-center gap-2 mt-3">
                    <AdminTypeBadge type={user?.type || ""} />

                    {/* Account Source Badge */}
                    {user?.accountCreatedVia === "admin" && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]">
                        Admin Onboarded
                      </Badge>
                    )}
                    {user?.accountCreatedVia === "bulk_import" && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px]">
                        Bulk Imported
                      </Badge>
                    )}
                    {user?.accountCreatedVia === "mobile" && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[10px]">
                        Mobile App
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Contact & Identity Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>1. Contact & Identity Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <DetailCard icon={<Phone className="w-4 h-4" />} label="Phone Number" value={user?.phoneNumber} />
              <DetailCard icon={<CreditCard className="w-4 h-4" />} label="ID Number" value={user?.idNumber} />
              <DetailCard icon={<MapPin className="w-4 h-4" />} label="Community / Location" value={user?.communityName} />
              <DetailCard icon={<Calendar className="w-4 h-4" />} label="Registration Date" value={user?.dateOfRegistration} />
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
              <p className="text-xs text-muted-foreground font-medium">Fetching agricultural profile data...</p>
            </div>
          )}

          {/* Section 2: Farmer Farm Details */}
          {!isLoading && isFarmer && extras && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4" />
                  <span>2. Farms & Agricultural Profile</span>
                </h3>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
                  {extras.farms.length} {extras.farms.length === 1 ? "Farm Record" : "Farm Records"}
                </Badge>
              </div>

              {extras.farms.length > 0 ? (
                <div className="space-y-3">
                  {extras.farms.map((farm, idx) => (
                    <div
                      key={farm.id || idx}
                      className="rounded-xl border border-emerald-500/20 bg-muted/30 p-4 space-y-3 shadow-sm hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{farm.farmName || "Farm"}</span>
                        </div>
                        <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                          {farm.farmSize} {farm.farmSizeUnit || "acres"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {(farm.region || farm.district) && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Location: <strong className="text-foreground font-medium">{[farm.district, farm.region].filter(Boolean).join(", ")}</strong></span>
                          </div>
                        )}
                        {farm.mainCrop && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Main Crop: <strong className="text-foreground font-medium">{farm.mainCrop}</strong></span>
                          </div>
                        )}
                        {farm.landOwnership && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ownership: <strong className="text-foreground font-medium capitalize">{farm.landOwnership}</strong></span>
                          </div>
                        )}
                        {farm.latitude && farm.longitude && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                            <span>GPS: <strong className="text-foreground font-medium">{farm.latitude.toFixed(3)}, {farm.longitude.toFixed(3)}</strong></span>
                          </div>
                        )}
                      </div>

                      {farm.cropTypes && farm.cropTypes.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Crops Cultivated
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {farm.cropTypes.map((crop) => (
                              <Badge
                                key={crop}
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs py-0.5"
                              >
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-6 rounded-xl bg-muted/20 border border-dashed border-border">
                  No farm records on file for this user yet.
                </div>
              )}
            </div>
          )}

          {/* Section 2: Service Provider Services & Equipment */}
          {!isLoading && isProvider && extras && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Tractor className="w-4 h-4" />
                <span>2. Services Rendered & Mechanization</span>
              </h3>

              {extras.servicesOffered.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Services Rendered
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {extras.servicesOffered.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs py-1 px-3 gap-1.5 font-medium"
                      >
                        <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="capitalize">{s.replace("_", " ")}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4 rounded-xl bg-muted/20 border border-dashed border-border">
                  No services specified.
                </div>
              )}

              {extras.equipment.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Equipment Inventory</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {extras.equipment.map((eq, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center gap-3"
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                          <Tractor className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate">{eq.name || eq.type || "Equipment"}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {[eq.brand, eq.model].filter(Boolean).join(" • ") || "Operational"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer Bar */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3 bg-muted/30 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
