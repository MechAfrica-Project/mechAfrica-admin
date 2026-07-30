"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Info, Trash2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminTypeBadge } from "./admin-type-badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import AdminDetailsDialog from "./AdminDetailsDialog";
import { useState } from "react";

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

interface AdminRowProps {
  admin: Admin;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

export function AdminRow({
  admin,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: AdminRowProps) {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <TableRow className="border-border hover:bg-muted/30">
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{admin.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{admin.name}</span>
              
              {/* Registration Source Badges */}
              {admin.accountCreatedVia === "bulk_import" && (
                <span className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
                  Imported
                </span>
              )}
              {admin.accountCreatedVia === "mobile" && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  App
                </span>
              )}
              {admin.accountCreatedVia === "web" && (
                <span className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                  Web
                </span>
              )}
              {admin.accountCreatedVia === "agent" && (
                <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Agent
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              @{admin.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <AdminTypeBadge type={admin.type} />
      </TableCell>
      <TableCell className="text-foreground">{admin.phoneNumber}</TableCell>
      <TableCell className="text-foreground">
        {admin.dateOfRegistration}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setInfoOpen(true)}
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title={`Delete ${admin.name}`}
            description={`Are you sure you want to delete ${admin.name}? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={() => {
              setOpen(false);
              onDelete();
            }}
          />
          <AdminDetailsDialog
            open={infoOpen}
            onOpenChange={setInfoOpen}
            user={admin}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
