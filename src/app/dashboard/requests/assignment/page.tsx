"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useRequestsStore, RequestsState } from "@/stores/useRequestsStore";
import { FrontendRequestItem } from "@/lib/api/types";
import AssignProviderDialog from "./_components/AssignProviderDialog";
import { Button } from "@/components/ui/button";
import { Calendar, Tractor, Trees, ArrowRight, UserCircle2, Loader2, MapPin } from "lucide-react";

export default function Assignment() {
  const { setTitle } = useHeaderStore();
  const fetchRequests = useRequestsStore((s: RequestsState) => s.fetchRequests);
  const requests = useRequestsStore((s: RequestsState) => s.requests);
  const isLoading = useRequestsStore((s: RequestsState) => s.isLoading);

  const [selectedRequest, setSelectedRequest] = useState<FrontendRequestItem | null>(null);

  useEffect(() => {
    setTitle("Manual Assignment");
    fetchRequests();
  }, [setTitle, fetchRequests]);

  // Filter for requests that need manual assignment ("Wait" maps to "pending")
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === "Wait" || r.status === "Offline");
  }, [requests]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(new Date(dateString));
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-muted/30 min-h-[calc(100vh-4rem)]">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Pending Assignments
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and match pending service requests with eligible providers.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium text-sm flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {pendingRequests.length} Pending {pendingRequests.length === 1 ? 'Request' : 'Requests'}
        </div>
      </div>

      {/* Content Area */}
      {isLoading && requests.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading requests...</p>
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card text-center p-8 shadow-sm">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Tractor className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No pending assignments</h3>
          <p className="text-muted-foreground max-w-sm">
            All service requests have been accepted by providers. Great job!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRequests.map((req) => (
            <div 
              key={req.id} 
              className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-border/50 flex justify-between items-start bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {req.farmerFirstName?.[0] || '?'}{req.farmerLastName?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground truncate max-w-[150px]">
                      {req.farmerFirstName} {req.farmerLastName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {req.requestId}
                    </p>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2.5 py-1 rounded-md text-xs font-semibold">
                  Pending
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Tractor className="h-3.5 w-3.5" /> Service
                    </p>
                    <p className="font-medium text-sm text-foreground capitalize">
                      {req.serviceType.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Trees className="h-3.5 w-3.5" /> Farm Details
                    </p>
                    <p className="font-medium text-sm text-foreground capitalize truncate">
                      {req.farmSize} Acres • {req.cropType}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Schedule
                  </p>
                  <p className="font-medium text-sm text-foreground">
                    {formatDate(req.startDate)} <span className="text-muted-foreground mx-1">→</span> {formatDate(req.endDate)}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0">
                <Button 
                  onClick={() => setSelectedRequest(req)}
                  className="w-full rounded-lg shadow-sm group-hover:bg-primary/90 transition-colors"
                >
                  Assign Provider
                  <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssignProviderDialog 
        open={!!selectedRequest} 
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
}
