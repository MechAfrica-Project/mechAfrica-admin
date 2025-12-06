"use client";

import { useState, useEffect } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useContactsStore } from "@/stores/useContactsStore";
import type { Contact as StoreContact } from "@/stores/useContactsStore";
import { Contact } from "@/types/types";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { NewContactInput } from "@/types/custom";
import DataTable from "./_components/data-table";
import { columns } from "./_components/columns";
import AddContactDialog from "./_components/add-contact-dialog";
import EditContactDialog from "./_components/edit-contact-dialog";
import DeleteConfirmDialog from "./_components/delete-confirm-dialog";

// Helper to convert store contact to types contact
function toTypesContact(c: StoreContact): Contact {
  const base = {
    id: c.id,
    firstName: c.firstName,
    otherNames: c.otherNames,
    gender: c.gender,
    phone: c.phone,
    region: c.region,
    registrationDate: c.registrationDate,
    initials: c.initials,
    profileImage: c.profileImage ?? undefined,
  };

  if (c.type === "Farmer") {
    return {
      ...base,
      type: "Farmer" as const,
      farmName: c.farmName ?? "",
      farmSize: c.farmSize ?? 0,
      farmSizeUnit: (c.farmSizeUnit as "Acre" | "Hectare") ?? "Acre",
      crops: (c.crops as ("Maize" | "Wheat" | "Rice" | "Cassava")[]) ?? [],
      formLocation: c.formLocation ?? "",
      district: c.district,
    };
  } else if (c.type === "Provider") {
    return {
      ...base,
      type: "Provider" as const,
      services: c.services ?? [],
      district: c.district,
    };
  } else {
    return {
      ...base,
      type: "Agent" as const,
      district: c.district,
      assignedRegion: c.assignedRegion ?? "",
    };
  }
}

export default function DatabasePage() {
  const { setTitle, setFilters, selectedFilters } = useHeaderStore();

  // Contacts store
  const farmers = useContactsStore((state) => state.farmers);
  const providers = useContactsStore((state) => state.providers);
  const agents = useContactsStore((state) => state.agents);
  const isLoading = useContactsStore((state) => state.isLoading);
  const error = useContactsStore((state) => state.error);
  const fetchFarmers = useContactsStore((state) => state.fetchFarmers);
  const fetchProviders = useContactsStore((state) => state.fetchProviders);
  const fetchAgents = useContactsStore((state) => state.fetchAgents);
  const clearError = useContactsStore((state) => state.clearError);

  // Local state for dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  // Fetch all contacts on mount
  useEffect(() => {
    fetchFarmers();
    fetchProviders();
    fetchAgents();
  }, [fetchFarmers, fetchProviders, fetchAgents]);

  // Set page title and filters
  useEffect(() => {
    setTitle("Database");
    setFilters({
      Users: [
        { label: "All Users", value: "all" },
        { label: "Farmers", value: "farmer" },
        { label: "Providers", value: "provider" },
        { label: "Agents", value: "agent" },
      ],
    });
  }, [setTitle, setFilters]);

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Convert store contacts to types contacts
  const typedFarmers = farmers.map(toTypesContact);
  const typedProviders = providers.map(toTypesContact);
  const typedAgents = agents.map(toTypesContact);

  // Combine all contacts
  const allContacts: Contact[] = [...typedFarmers, ...typedProviders, ...typedAgents];

  // Filter contacts based on selected filter
  const filteredContacts = (() => {
    const sel = selectedFilters["Users"] || "all";
    if (sel === "all") return allContacts;
    if (sel === "farmer") return typedFarmers;
    if (sel === "provider") return typedProviders;
    if (sel === "agent") return typedAgents;
    return allContacts;
  })();

  // Refresh data
  const handleRefresh = () => {
    fetchFarmers();
    fetchProviders();
    fetchAgents();
  };

  // Handle add contact (local only for now - backend create endpoints may vary)
  const handleAddContact = (newContact: NewContactInput) => {
    // For now, this is a placeholder - backend integration for creating contacts
    // would need specific endpoints for each user type
    console.log("Add contact:", newContact);
    setShowAddDialog(false);
    // Refresh to get latest data
    handleRefresh();
  };

  // Handle edit contact (local only for now)
  const handleEditContact = (updatedContact: Contact) => {
    console.log("Edit contact:", updatedContact);
    setEditingContact(null);
    handleRefresh();
  };

  // Handle delete contact (local only for now)
  const handleDeleteContact = (id: string) => {
    console.log("Delete contact:", id);
    setDeletingContactId(null);
    handleRefresh();
  };

  // Loading state
  if (isLoading && allContacts.length === 0) {
    return (
      <main className="p-3 md:px-6">
        <div className="mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00594C] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && allContacts.length === 0) {
    return (
      <main className="p-3 md:px-6">
        <div className="mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Failed to load contacts</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-[#00594C] text-white rounded-lg hover:bg-[#00594cd4] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-3 md:px-6">
      <div className="mx-auto">
        {/* Error banner if there's an error but we have cached data */}
        {error && allContacts.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button
              onClick={() => clearError()}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header with Add and Refresh buttons */}
        <div className="mb-2 flex justify-end items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="lg"
            className="cursor-pointer"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="cursor-pointer bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Stats summary */}
        <div className="mb-4 flex gap-4 text-sm text-gray-600">
          <span>Total: <strong>{allContacts.length}</strong></span>
          <span>Farmers: <strong>{typedFarmers.length}</strong></span>
          <span>Providers: <strong>{typedProviders.length}</strong></span>
          <span>Agents: <strong>{typedAgents.length}</strong></span>
        </div>

        {/* Data table */}
        <DataTable
          columns={columns({
            onEdit: setEditingContact,
            onDelete: setDeletingContactId,
          })}
          data={filteredContacts}
        />
      </div>

      {/* Dialogs */}
      <AddContactDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddContact}
      />
      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onUpdate={handleEditContact}
        />
      )}
      {deletingContactId && (
        <DeleteConfirmDialog
          open={!!deletingContactId}
          onOpenChange={(open) => !open && setDeletingContactId(null)}
          onConfirm={() => handleDeleteContact(deletingContactId)}
        />
      )}
    </main>
  );
}
