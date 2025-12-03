"use client";

import { useEffect, useState } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { AddAdminDialog } from "./_components/add-admin-dialog";
import { AdminsTable } from "./_components/admins-table";
import { useAdminsStore, AdminsState, Admin } from "@/stores/useAdminsStore";
import { useTableStore, TableStore } from "@/stores/useTableStore";

export default function AdminsPage() {
  const admins = useAdminsStore((s: AdminsState) => s.admins);
  const addAdmin = useAdminsStore((s: AdminsState) => s.addAdmin);
  const deleteAdmin = useAdminsStore((s: AdminsState) => s.deleteAdmin);
  const { setTitle, setFilters, selectedFilters } = useHeaderStore();

  const selectedAdmins = useTableStore((s: TableStore) => s.selections['admins'] || []);
  const toggleSelect = useTableStore((s: TableStore) => s.toggleSelect);
  const clearSelection = useTableStore((s: TableStore) => s.clearSelection);

  const [isDialogOpen, setIsDialogOpen] = useState(false);



  // Set page title
  useEffect(() => {
    setTitle("Admin");
    setFilters({
      Users: [
        { label: "All Users", value: "all" },
        { label: "Admin", value: "admin" },
        { label: "Providers", value: "provider" },
        { label: "Accounting", value: "accounting" },
      ],
    });
  }, [setTitle, setFilters]);

  // Listen for action tab events from HeaderTabs
  useEffect(() => {
    const handleOpenModal = () => setIsDialogOpen(true);
    window.addEventListener("open-agent-modal", handleOpenModal);
    return () =>
      window.removeEventListener("open-agent-modal", handleOpenModal);
  }, []);

  const handleAddAdmin = (newAdmin: Omit<Admin, "id">) => {
    addAdmin(newAdmin);
    setIsDialogOpen(false);
  };

  const handleSelectAdmin = (id: string) => {
    toggleSelect('admins', id);
  };

  const handleDeleteAdmin = (id: string) => {
    deleteAdmin(id);
    clearSelection('admins');
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <AdminsTable
          admins={
            // Apply header-selected filter (Users)
            (() => {
              const sel = selectedFilters["Users"] || "all";
              if (sel === "all") return admins;
              return admins.filter((a) =>
                a.type.toLowerCase().includes(sel.toLowerCase())
              );
            })()
          }
          selectedAdmins={selectedAdmins}
          onSelectAdmin={handleSelectAdmin}
          onDeleteAdmin={handleDeleteAdmin}
        />
        <AddAdminDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAddAdmin={handleAddAdmin}
        />
      </div>
    </main>
  );
}
