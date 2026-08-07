"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/ui/pagination";
import ListCard from "@/components/lists/ListCard";
import type { FrontendRequestItem, BackendNotificationLog } from "@/lib/api";
import { AlertCircle, ChevronDown, ChevronRight, MessageSquare, Bell, Smartphone, Mail, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "N/A";
  }
}

function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return "N/A";
  }
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  sms: <Smartphone className="w-3.5 h-3.5" />,
  push: <Bell className="w-3.5 h-3.5" />,
  in_app: <MessageSquare className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
};

const CHANNEL_LABELS: Record<string, string> = {
  sms: "SMS",
  push: "Push",
  in_app: "In-App",
  email: "Email",
  skipped: "Skipped",
};

interface ServiceRequestsTableProps {
  requests: FrontendRequestItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ServiceRequestsTable({
  requests,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: ServiceRequestsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Record<string, BackendNotificationLog[]>>({});
  const [logsLoading, setLogsLoading] = useState<Record<string, boolean>>({});

  const toggleExpand = async (requestId: string) => {
    if (expandedId === requestId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(requestId);
    if (logs[requestId]) return; // already loaded

    setLogsLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      const res = await api.getRequestNotificationLogs(requestId);
      setLogs((prev) => ({ ...prev, [requestId]: res.data || [] }));
    } catch {
      setLogs((prev) => ({ ...prev, [requestId]: [] }));
    } finally {
      setLogsLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "wait":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
      case "in_progress":
      case "work_started":
      case "ongoing":
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLogStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "text-green-700 bg-green-50";
      case "failed": return "text-red-700 bg-red-50";
      case "skipped": return "text-amber-700 bg-amber-50";
      default: return "text-gray-700 bg-gray-50";
    }
  };

  return (
    <ListCard
      footer={
        totalPages > 1 ? (
          <div className="mt-2">
            <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{String(currentPage).padStart(2, "0")}</span>{" "}
              of <span className="font-semibold text-foreground">{String(totalPages).padStart(2, "0")}</span>
            </div>
          </div>
        ) : null
      }
    >
      {isLoading && requests.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-10 rounded-t-xl">
          <div className="h-full bg-primary animate-[progress_1s_ease-in-out_infinite]" style={{ width: "50%", transformOrigin: "0% 50%" }} />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Request ID</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Farmer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Service / Crop</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && requests.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[120px] mb-1" />
                  <Skeleton className="h-3 w-[80px]" />
                </TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px] mb-1" />
                  <Skeleton className="h-3 w-[80px]" />
                </TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No service requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => {
              const isExpanded = expandedId === request.id;
              const requestLogs = logs[request.id];
              const isLogLoading = logsLoading[request.id];

              return (
                <>
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => toggleExpand(request.id)}
                  >
                    <TableCell>
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {request.handle || request.requestId.substring(0, 8)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.providerName !== "Unassigned"
                          ? `Provider: ${request.providerName}`
                          : <span className="text-amber-600">Unassigned</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {request.farmerPhoneNumber || "N/A"}
                    </TableCell>
                    <TableCell
                      className="text-sm max-w-[160px] truncate"
                      title={request.farmLocation}
                    >
                      {request.farmLocation || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium capitalize">
                        {request.serviceType?.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.cropType} &bull; {request.farmSize} acres
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{formatDate(request.startDate)}</span>
                        {request.isASAP && (
                          <Badge
                            variant="destructive"
                            className="px-1.5 py-0 text-[10px] uppercase font-bold flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" /> ASAP
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${getStatusColor(request.status)}`}
                      >
                        {request.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Expanded notification logs panel */}
                  {isExpanded && (
                    <TableRow key={`${request.id}-logs`} className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={9} className="p-0">
                        <div className="px-8 py-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                            Providers Notified
                          </p>

                          {isLogLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading notification logs...
                            </div>
                          ) : !requestLogs || requestLogs.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic py-2">
                              No notification logs found. Logs are only available for requests created after this feature was deployed.
                            </p>
                          ) : (
                            <div className="overflow-x-auto rounded-md border bg-background">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b text-muted-foreground">
                                    <th className="text-left px-3 py-2 font-medium">Provider</th>
                                    <th className="text-left px-3 py-2 font-medium">Phone</th>
                                    <th className="text-left px-3 py-2 font-medium">Channel</th>
                                    <th className="text-left px-3 py-2 font-medium">Status</th>
                                    <th className="text-left px-3 py-2 font-medium">Reason</th>
                                    <th className="text-left px-3 py-2 font-medium">Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {requestLogs.map((log) => (
                                    <tr key={log.id} className="border-b last:border-0">
                                      <td className="px-3 py-2 font-medium">{log.provider_name || "—"}</td>
                                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{log.phone_number || "—"}</td>
                                      <td className="px-3 py-2">
                                        <span className="flex items-center gap-1.5 capitalize">
                                          {CHANNEL_ICONS[log.channel]}
                                          {CHANNEL_LABELS[log.channel] || log.channel}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getLogStatusColor(log.status)}`}>
                                          {log.status}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-muted-foreground text-xs max-w-[200px] truncate" title={log.error_message}>
                                        {log.error_message || "—"}
                                      </td>
                                      <td className="px-3 py-2 text-muted-foreground text-xs tabular-nums">
                                        {formatDateTime(log.created_at)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })
          )}
        </TableBody>
      </Table>
    </ListCard>
  );
}
