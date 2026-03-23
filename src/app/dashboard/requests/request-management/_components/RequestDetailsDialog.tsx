"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestItem } from "@/stores/useRequestsStore";
import {
  User,
  Calendar,
  MapPin,
  Tractor,
  Wheat,
  Clock,
  Building2,
  Loader2,
  Phone,
  CheckCircle,
  ArrowLeft,
  Star,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { EligibleProviderDTO } from "@/lib/api/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: RequestItem | null;
}

function StatusBadge({ status }: { status: RequestItem["status"] }) {
  const variants: Record<RequestItem["status"], string> = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Offline: "bg-gray-100 text-gray-700 border-gray-200",
    Wait: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
    Completed: "bg-blue-100 text-blue-700 border-blue-200",
    Ongoing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {status}
    </Badge>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default function RequestDetailsDialog({
  open,
  onOpenChange,
  row,
}: Props) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [providers, setProviders] = useState<EligibleProviderDTO[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setIsAssigning(false);
      setProviders([]);
    }
  }, [open]);

  const fetchProviders = async () => {
    if (!row) return;
    setIsLoadingProviders(true);
    setIsAssigning(true);
    try {
      const actualId = row.requestId || (row as any).id;
      const res = await api.getEligibleProviders(actualId);
      if (res.success) {
        setProviders(res.data || []);
      } else {
        toast.error(res.message || "Failed to fetch providers");
        setProviders([]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Error fetching providers");
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const handleAssignProvider = async (providerId: string) => {
    if (!row) return;
    setIsSubmitting(providerId);
    try {
      const actualId = row.requestId || (row as any).id;
      const res = await api.reassignServiceRequest(actualId, providerId);
      if (res.success) {
        toast.success("Provider successfully assigned!");
        onOpenChange(false);
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        toast.error(res.message || "Failed to assign provider");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error assigning provider");
    } finally {
      setIsSubmitting(null);
    }
  };

  if (!row) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>No request selected.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-center text-muted-foreground">
            No details available.
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {isAssigning ? "Assign Service Provider" : "Request Details"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Request ID: {row.requestId || row.handle || row.id}
              </DialogDescription>
            </div>
            <StatusBadge status={row.status} />
          </div>
        </DialogHeader>

        {isAssigning ? (
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAssigning(false)}
              className="mb-2 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
            
            {isLoadingProviders ? (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading eligible providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">No eligible providers found for this request type.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((pkg) => (
                  <div key={pkg.service_provider_id} className="p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors">
                    <div>
                      <h4 className="font-semibold text-sm">{pkg.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {pkg.distance_km != null ? `${pkg.distance_km.toFixed(1)} km away` : "Distance unknown"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] flex items-center gap-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200 border">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          {pkg.rating > 0 ? pkg.rating.toFixed(1) : "New"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {pkg.completed_jobs} Jobs
                        </Badge>
                        {pkg.has_equipment && (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 border text-[10px]">
                            <CheckCircle className="w-3 h-3 mr-1" /> Equip Match
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <a href={`tel:${pkg.phone_number}`} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded-md transition-colors w-full justify-center">
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                      <Button 
                        size="sm" 
                        onClick={() => handleAssignProvider(pkg.service_provider_id)}
                        disabled={isSubmitting === pkg.service_provider_id}
                        className="w-full shadow-sm"
                      >
                        {isSubmitting === pkg.service_provider_id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-6">
          {/* Farmer Information */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Farmer Information
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium">{row.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Farmer ID</p>
                  <p className="text-sm font-medium font-mono">
                    {row.farmerId || "N/A"}
                  </p>
                </div>
              </div>
              {row.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{row.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 dark:bg-gray-700" />

          {/* Service Details */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Tractor className="w-4 h-4" />
              Service Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                icon={Tractor}
                label="Service Type"
                value={row.serviceType || "N/A"}
              />
              <DetailRow
                icon={MapPin}
                label="Farm Size"
                value={row.farmSize ? `${row.farmSize} acres` : "N/A"}
              />
              <DetailRow
                icon={Wheat}
                label="Crop Type"
                value={row.cropType || "N/A"}
              />
              <DetailRow
                icon={Building2}
                label="Service Provider"
                value={row.providerName || "Unassigned"}
              />
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 dark:bg-gray-700" />

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                icon={Calendar}
                label="Start Date"
                value={row.startDate || "Not set"}
              />
              <DetailRow
                icon={Calendar}
                label="End Date"
                value={row.endDate || "Not set"}
              />
              <DetailRow
                icon={Clock}
                label="Created"
                value={row.createdAt || row.date || "N/A"}
              />
              <DetailRow
                icon={Clock}
                label="Last Updated"
                value={row.updatedAt || "N/A"}
              />
            </div>
          </div>
          </div>
        )}

        {!isAssigning && (
          <div className="flex justify-end mt-6 gap-2">
            {(row.status === "Wait" || !row.providerName || row.providerName === "Unassigned") && (
              <Button onClick={fetchProviders}>Assign Provider</Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
