import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { FrontendAdmin, AdminUpdateUserRequest } from "@/lib/api";
import { AdminRow } from "./admin-row";
import { EditUserDialog } from "./edit-user-dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import Pagination from "@/components/ui/pagination";

interface MissingDataModalProps {
  filterType: string | null;
  onClose: () => void;
}

export function MissingDataModal({ filterType, onClose }: MissingDataModalProps) {
  const [users, setUsers] = useState<FrontendAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Edit state
  const [editingUser, setEditingUser] = useState<FrontendAdmin | null>(null);

  useEffect(() => {
    if (filterType) {
      loadUsers(1);
    } else {
      setUsers([]);
      setPage(1);
      setTotalPages(1);
    }
  }, [filterType]);

  const loadUsers = async (targetPage: number) => {
    if (!filterType) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getAdmins(targetPage, limit, undefined, undefined, filterType);
      if (response.success) {
        setUsers(response.data);
        setPage(response.pagination?.page || 1);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (filterType) {
      case "missing_phone":
        return "Profiles Missing Phone Number";
      case "missing_name":
        return "Profiles Missing Name";
      case "missing_location":
        return "Profiles Missing Location";
      case "missing_id":
        return "Profiles Missing ID Number";
      default:
        return "Profiles Requiring Attention";
    }
  };

  const handleSaveUser = async (userId: string, data: AdminUpdateUserRequest): Promise<boolean> => {
    try {
      await api.updateUserByAdmin(userId, data);
      await loadUsers(page);
      return true;
    } catch (err) {
      console.error("Failed to update user:", err);
      return false;
    }
  };

  return (
    <>
    <Dialog open={!!filterType} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-muted/20">
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-0 relative min-h-[300px]">
          {isLoading && users.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#00594C]" />
            </div>
          ) : error && users.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              No profiles found for this filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-card">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Phone number</TableHead>
                  <TableHead className="text-foreground">Date of Registration</TableHead>
                  <TableHead className="w-12 text-center text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <AdminRow
                    key={user.id}
                    admin={user}
                    isSelected={false}
                    onSelect={() => {}}
                    onDelete={() => {}}
                    onEdit={() => setEditingUser(user)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <Pagination current={page} total={totalPages} onChange={loadUsers} />
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{String(page).padStart(2, "0")}</span> of <span className="font-semibold text-foreground">{String(totalPages).padStart(2, "0")}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {editingUser && (
      <EditUserDialog
        isOpen={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        userId={editingUser.id}
        initialData={{
          name: editingUser.name,
          phoneNumber: editingUser.phoneNumber,
          idNumber: editingUser.idNumber,
          communityName: editingUser.communityName,
        }}
        onSave={handleSaveUser}
      />
    )}
  </>
  );
}
