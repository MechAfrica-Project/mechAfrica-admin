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
import { api } from "@/lib/api/client";
import { EligibleProviderDTO, FrontendRequestItem } from "@/lib/api/types";
import { toast } from "sonner";
import { Loader2, MapPin, Star, Briefcase, User2 } from "lucide-react";
import { useRequestsStore, RequestsState } from "@/stores/useRequestsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FrontendRequestItem | null;
}

export default function AssignProviderDialog({ open, onOpenChange, request }: Props) {
  const [providers, setProviders] = useState<EligibleProviderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  
  const fetchRequests = useRequestsStore((s: RequestsState) => s.fetchRequests);

  useEffect(() => {
    if (open && request?.id) {
      loadProviders(request.id);
    } else {
      setProviders([]);
    }
  }, [open, request?.id]);

  const loadProviders = async (reqId: string) => {
    try {
      setLoading(true);
      const res = await api.getEligibleProviders(reqId);
      if (res.success && res.data) {
        setProviders(res.data);
      } else {
        toast.error("Failed to load providers");
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching providers");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (providerId: string) => {
    if (!request?.id) return;
    try {
      setAssigningId(providerId);
      const res = await api.reassignServiceRequest(request.id, providerId);
      if (res.success) {
        toast.success("Provider assigned successfully");
        fetchRequests(); // Refresh the global store
        onOpenChange(false);
      } else {
        toast.error("Assignment failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error assigning provider");
    } finally {
      setAssigningId(null);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-background rounded-2xl shadow-xl border-border">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/60 bg-muted/30">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              Select a Provider
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choose an eligible provider to handle request <span className="font-medium text-foreground">{request.requestId}</span> ({request.serviceType.replace(/_/g, " ").toLowerCase()}).
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-0 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Finding eligible providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">No providers found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                There are currently no eligible service providers in the vicinity for this request type.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {providers.map((p) => (
                <div 
                  key={p.service_provider_id} 
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 rounded-full bg-primary/10 items-center justify-center text-primary">
                      <User2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-medium text-foreground truncate">{p.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm">
                          <MapPin className="h-3 w-3" />
                          {p.distance_km !== null ? `${p.distance_km.toFixed(1)} km` : 'Unknown distance'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-foreground">{p.rating.toFixed(1)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {p.completed_jobs} jobs
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 shrink-0">
                    <Button 
                      onClick={() => handleAssign(p.service_provider_id)}
                      disabled={assigningId !== null}
                      size="sm"
                      className="rounded-full px-5 font-medium transition-all shadow-sm"
                    >
                      {assigningId === p.service_provider_id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        "Assign"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
