"use client";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import ListCard from "@/components/lists/ListCard";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminRow } from "./admin-row";

interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: string;
  phoneNumber: string;
  dateOfRegistration: string;
}

interface AdminsTableProps {
  admins: Admin[];
  selectedAdmins: string[];
  onSelectAdmin: (id: string) => void;
  onDeleteAdmin: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function AdminsTable({
  admins,
  selectedAdmins,
  onSelectAdmin,
  onDeleteAdmin,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: AdminsTableProps) {
  // Server-side pagination - admins are already the current page's data
  const pagedAdmins = admins;
  const handleSelectAll = (checked?: boolean | "indeterminate") => {
    const shouldSelect = Boolean(checked);
    if (shouldSelect) {
      // Select all on current page
      pagedAdmins.forEach((admin) => {
        if (!selectedAdmins.includes(admin.id)) {
          onSelectAdmin(admin.id);
        }
      });
    } else {
      // Deselect all on current page
      pagedAdmins.forEach((admin) => {
        if (selectedAdmins.includes(admin.id)) {
          onSelectAdmin(admin.id);
        }
      });
    }
  };

  const allSelected = pagedAdmins.length > 0 && pagedAdmins.every((a) => selectedAdmins.includes(a.id));
  const someSelected = pagedAdmins.some((a) => selectedAdmins.includes(a.id)) && !allSelected;

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00594C]"></div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-card">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                data-indeterminate={someSelected || undefined}
              />
            </TableHead>
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Type</TableHead>
            <TableHead className="text-foreground">Phone number</TableHead>
            <TableHead className="text-foreground">
              Date of Registration
            </TableHead>
            <TableHead className="w-12 text-center text-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedAdmins.map((admin) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              isSelected={selectedAdmins.includes(admin.id)}
              onSelect={() => onSelectAdmin(admin.id)}
              onDelete={() => onDeleteAdmin(admin.id)}
            />
          ))}
        </TableBody>
      </Table>
    </ListCard>
  );
}
