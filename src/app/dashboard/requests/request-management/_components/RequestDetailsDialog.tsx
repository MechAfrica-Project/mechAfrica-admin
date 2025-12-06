"use client";

import React from "react";
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
} from "lucide-react";

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
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
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
              <DialogTitle className="text-xl">Request Details</DialogTitle>
              <DialogDescription className="mt-1">
                Request ID: {row.requestId || row.handle || row.id}
              </DialogDescription>
            </div>
            <StatusBadge status={row.status} />
          </div>
        </DialogHeader>

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
                  <p className="text-sm font-medium font-mono text-xs">
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

          <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />

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

          <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />

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

        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
