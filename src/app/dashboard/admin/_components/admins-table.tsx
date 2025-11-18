import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
}

export function AdminsTable({
  admins,
  selectedAdmins,
  onSelectAdmin,
  onDeleteAdmin,
}: AdminsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all
      admins.forEach((admin) => {
        if (!selectedAdmins.includes(admin.id)) {
          onSelectAdmin(admin.id);
        }
      });
    } else {
      // Deselect all
      selectedAdmins.forEach((id) => onSelectAdmin(id));
    }
  };

  const allSelected =
    admins.length > 0 && selectedAdmins.length === admins.length;
  const someSelected =
    selectedAdmins.length > 0 && selectedAdmins.length < admins.length;

  return (
    <div className="rounded-lg border border-border bg-card">
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
          {admins.map((admin) => (
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

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 border-t border-border px-6 py-4">
        {Array.from({ length: 6 }, (_, i) => (
          <button
            key={i + 1}
            className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
              i === 0
                ? "bg-muted text-muted-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
        <span className="text-muted-foreground">...</span>
        <button className="h-8 w-8 rounded text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
          04
        </button>
        <button className="h-8 w-8 rounded text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
          05
        </button>
        <button className="h-8 w-8 rounded text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
          06
        </button>
      </div>
    </div>
  );
}
