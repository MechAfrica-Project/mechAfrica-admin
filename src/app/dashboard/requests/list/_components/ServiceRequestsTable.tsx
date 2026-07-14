import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import ListCard from "@/components/lists/ListCard";
import type { FrontendRequestItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

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

  return (
    <ListCard
      footer={
        totalPages > 1 ? (
          <div className="mt-2">
            <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{String(currentPage).padStart(2, "0")}</span> of <span className="font-semibold text-foreground">{String(totalPages).padStart(2, "0")}</span>
            </div>
          </div>
        ) : null
      }
    >
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
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
          {requests.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No service requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium text-xs">
                  {request.handle || request.requestId.substring(0, 8)}
                </TableCell>
                <TableCell className="text-sm">
                  {request.createdAt ? formatDate(request.createdAt) : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{request.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.providerName !== "Unassigned" ? `Assigned: ${request.providerName}` : "Unassigned"}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {request.farmerPhoneNumber || "N/A"}
                </TableCell>
                <TableCell className="text-sm max-w-[150px] truncate" title={request.farmLocation}>
                  {request.farmLocation || "N/A"}
                </TableCell>
                <TableCell>
                  <div className="font-medium capitalize">{request.serviceType?.replace("_", " ")}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.cropType} • {request.farmSize} acres
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">
                      {request.startDate ? formatDate(request.startDate) : "N/A"}
                    </span>
                    {request.isASAP && (
                      <Badge variant="destructive" className="px-1.5 py-0 text-[10px] uppercase font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> ASAP
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize ${getStatusColor(request.status)}`}>
                    {request.status.replace("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ListCard>
  );
}
