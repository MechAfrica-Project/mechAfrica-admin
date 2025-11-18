"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@/types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ColumnsConfig {
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: ColumnsConfig): ColumnDef<Contact>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        className="mx-2"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const contact = row.original;
      const fullName = `${contact.firstName} ${contact.otherNames || ""}`;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-teal-600 text-white font-semibold text-xs">
              {contact.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{fullName.trim()}</span>
            <span className="text-xs text-muted-foreground">
              @{contact.firstName.toLowerCase()}
              {contact.type.slice(0, 2)}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const badgeColor =
        type === "Farmer"
          ? "bg-green-100 text-green-800"
          : type === "Agent"
          ? "bg-slate-100 text-slate-800"
          : "bg-amber-100 text-amber-800";

      return <Badge className={badgeColor}>{type}</Badge>;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone number",
    cell: ({ row }) => row.getValue("phone"),
  },
  {
    accessorKey: "registrationDate",
    header: "Date of Registration",
    cell: ({ row }) => row.getValue("registrationDate"),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(contact)}
            className="h-8 w-8 cursor-pointer"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(contact.id)}
            className="h-8 cursor-pointer w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
