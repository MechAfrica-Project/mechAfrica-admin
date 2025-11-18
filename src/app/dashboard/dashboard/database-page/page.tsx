"use client";

import { useState, useEffect } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Contact } from "@/types/types";
import { NewContactInput } from "@/types/custom";
import { dummyContacts } from "./lib/dummy-data";
import DataTable from "./_components/data-table";
import { columns } from "./_components/columns";
import AddContactDialog from "./_components/add-contact-dialog";
import EditContactDialog from "./_components/edit-contact-dialog";
import DeleteConfirmDialog from "./_components/delete-confirm-dialog";

export default function DatabasePage() {
  const { setTitle, setFilters } = useHeaderStore();
  const { selectedFilters } = useHeaderStore();
  const [contacts, setContacts] = useState<Contact[]>(dummyContacts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null
  );

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

  const handleAddContact = (newContact: NewContactInput) => {
    // Build a full Contact object with sensible defaults for missing fields.
    const name = newContact.name ?? "";
    const nameParts = name.trim().split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const otherNames = nameParts.slice(1).join(" ") || "";

    const baseCommon = {
      id: Date.now().toString(),
      firstName,
      otherNames,
      gender: newContact.gender ?? "Male",
      phone: newContact.phone ?? "",
      region: newContact.region ?? "",
      registrationDate: newContact.registrationDate ?? new Date().toISOString().split("T")[0],
      initials:
        newContact.initials ?? ((firstName[0] || "") + (otherNames[0] || "")).toUpperCase(),
      profileImage: newContact.profileImage,
    } as const;

    const type = newContact.type ?? "Farmer";

    let contact: Contact;
    if (type === "Farmer") {
      contact = {
        ...baseCommon,
        type: "Farmer",
        farmName: newContact.farmName ?? "",
        farmSize: newContact.farmSize ?? 0,
        farmSizeUnit: (newContact.farmSizeUnit as "Acre" | "Hectare") ?? "Acre",
        crops: newContact.crops ?? [],
        formLocation: newContact.formLocation ?? "",
        district: newContact.district ?? "",
      } as Contact;
    } else if (type === "Provider") {
      contact = {
        ...baseCommon,
        type: "Provider",
        services: newContact.services ?? [],
        district: newContact.district ?? "",
      } as Contact;
    } else {
      // Agent
      contact = {
        ...baseCommon,
        type: "Agent",
        district: newContact.district ?? "",
        assignedRegion: newContact.assignedRegion ?? "",
      } as Contact;
    }

    setContacts([...contacts, contact]);
    setShowAddDialog(false);
  };

  const handleEditContact = (updatedContact: Contact) => {
    setContacts(
      contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c))
    );
    setEditingContact(null);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    setDeletingContactId(null);
  };

  return (
    <main className="p-3 md:px-6">
      <div className=" mx-auto">
        {/* Header with Add button */}
        <div className="mb-2 flex justify-end items-center">
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="cursor-pointer bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
        <DataTable
          columns={columns({
            onEdit: setEditingContact,
            onDelete: setDeletingContactId,
          })}
          data={
            ((): Contact[] => {
              const sel = selectedFilters["Users"] || "all";
              if (sel === "all") return contacts;
              return contacts.filter((c) => c.type.toLowerCase() === sel.toLowerCase());
            })()
          }
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
