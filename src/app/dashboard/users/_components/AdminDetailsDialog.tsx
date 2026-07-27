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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <span className="mt-0.5 text-[#00594C] opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || "—"}</p>
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
        if (active && resp?.data) {
          setExtras({
            farms: (resp.data.farms || []) as AdminFarmDetail[],
            servicesOffered: resp.data.services_offered || [],
            equipment: resp.data.equipment || [],
          });
        }
      } catch {
        // Silent – still show basic info
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [open, user]);

  const isFarmer = user?.type === "Farmer";
  const isProvider = user?.type === "Provider";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#00594C] to-[#007a68] px-6 py-6 text-white rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white/30 shadow-lg">
                <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                  {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold text-white leading-tight">
                  {user?.name || "User"}
                </DialogTitle>
                <DialogDescription className="text-white/70 text-sm mt-1">
                  {user?.email || "No email"}
                </DialogDescription>
                <div className="mt-2">
                  <AdminTypeBadge type={user?.type || ""} />
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#00594C] border-b border-[#00594C]/20 pb-2">
              Contact &amp; Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow icon={<Phone size={15} />} label="Phone" value={user?.phoneNumber} />
              <DetailRow icon={<CreditCard size={15} />} label="ID Number" value={user?.idNumber} />
              <DetailRow icon={<MapPin size={15} />} label="Community" value={user?.communityName} />
              <DetailRow
                icon={<Calendar size={15} />}
                label="Registered"
                value={user?.dateOfRegistration}
              />
            </div>
          </section>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#00594C]" />
              <span className="ml-3 text-sm text-muted-foreground">Loading profile details…</span>
            </div>
          )}

          {/* Farmer – Farm Details */}
          {!isLoading && isFarmer && extras && extras.farms.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#00594C] border-b border-[#00594C]/20 pb-2">
                Farm Details
              </h3>
              <div className="space-y-4">
                {extras.farms.map((farm, idx) => (
                  <div
                    key={farm.id || idx}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-foreground">{farm.farmName}</p>
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                        {farm.farmSize} {farm.farmSizeUnit}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(farm.region || farm.district) && (
                        <DetailRow
                          icon={<MapPin size={13} />}
                          label="Location"
                          value={[farm.district, farm.region].filter(Boolean).join(", ")}
                        />
                      )}
                      {(farm.latitude || farm.longitude) ? (
                        <DetailRow
                          icon={<Navigation size={13} />}
                          label="Coordinates"
                          value={`${farm.latitude?.toFixed(4)}, ${farm.longitude?.toFixed(4)}`}
                        />
                      ) : null}
                    </div>
                    {farm.cropTypes && farm.cropTypes.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Wheat size={13} className="text-[#00594C] mt-1 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                          {farm.cropTypes.map((crop) => (
                            <span
                              key={crop}
                              className="text-xs bg-[#00594C]/10 text-[#00594C] px-2 py-0.5 rounded-full font-medium"
                            >
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isLoading && isFarmer && extras && extras.farms.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4 rounded-lg bg-muted/30 border border-dashed">
              No farm records on file.
            </div>
          )}

          {/* Provider – Services */}
          {!isLoading && isProvider && extras && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#00594C] border-b border-[#00594C]/20 pb-2">
                Services Offered
              </h3>
              {extras.servicesOffered.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {extras.servicesOffered.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 text-xs bg-[#00594C]/10 text-[#00594C] px-3 py-1 rounded-full font-medium"
                    >
                      <Wrench size={11} /> {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No services listed.</p>
              )}

              {extras.equipment.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#00594C] border-b border-[#00594C]/20 pb-2 pt-2">
                    Equipment
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {extras.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                      >
                        <Layers size={11} /> {eq.name || eq.type || "Equipment"}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end bg-muted/20 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-[#00594C]/10 hover:text-[#00594C] hover:border-[#00594C]/30 transition-colors"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
