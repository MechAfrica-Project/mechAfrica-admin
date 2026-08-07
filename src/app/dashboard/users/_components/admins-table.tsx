"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import ListCard from "@/components/lists/ListCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminRow } from "./admin-row";
import { EditUserDialog } from "./edit-user-dialog";
import { useState } from "react";
import { api } from "@/lib/api";
import type { AdminUpdateUserRequest } from "@/lib/api";

interface Admin {
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

interface AdminsTableProps {
  admins: Admin[];
  selectedAdmins: string[];
  onSelectAdmin: (id: string) => void;
  onDeleteAdmin: (id: string) => void;
  onRefresh?: () => void;
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
  onRefresh,
}: AdminsTableProps) {
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const handleSaveUser = async (userId: string, data: AdminUpdateUserRequest): Promise<boolean> => {
    try {
      await api.updateUserByAdmin(userId, data);
      onRefresh?.();
      return true;
    } catch (err) {
      console.error("Failed to update user:", err);
      return false;
    }
  };

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
    <>
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
      {isLoading && pagedAdmins.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00594C]/20 overflow-hidden z-10 rounded-t-xl">
          <div className="h-full bg-[#00594C] animate-[progress_1s_ease-in-out_infinite]" style={{ width: "50%", transformOrigin: "0% 50%" }} />
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
          {isLoading && pagedAdmins.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : pagedAdmins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            pagedAdmins.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                isSelected={selectedAdmins.includes(admin.id)}
                onSelect={() => onSelectAdmin(admin.id)}
                onDelete={() => onDeleteAdmin(admin.id)}
                onEdit={() => setEditingAdmin(admin)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </ListCard>

    {editingAdmin && (
      <EditUserDialog
        isOpen={!!editingAdmin}
        onOpenChange={(open) => !open && setEditingAdmin(null)}
        userId={editingAdmin.id}
        initialData={{
          name: editingAdmin.name,
          phoneNumber: editingAdmin.phoneNumber,
          idNumber: editingAdmin.idNumber,
          communityName: editingAdmin.communityName,
          type: editingAdmin.type,
        }}
        onSave={handleSaveUser}
      />
    )}
  </>
  );
}
