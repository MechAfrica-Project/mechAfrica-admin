import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminsHeaderProps {
  onAddClick: () => void;
}

export function AdminsHeader({ onAddClick }: AdminsHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your system administrators
        </p>
      </div>
      <Button onClick={onAddClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Add New Admin
      </Button>
    </div>
  );
}
