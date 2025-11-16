"use client";

import { useState, useEffect } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Contact } from "@/types/types";
import { dummyContacts } from "./lib/dummy-data";
import DataTable from "./_components/data-table";
import { columns } from "./_components/columns";
import AddContactDialog from "./_components/add-contact-dialog";
import EditContactDialog from "./_components/edit-contact-dialog";
import DeleteConfirmDialog from "./_components/delete-confirm-dialog";

export default function DatabasePage() {
  const { setTitle, setFilters } = useHeaderStore();
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

  const handleAddContact = (newContact: Omit<Contact, "id">) => {
    const contact: Contact = {
      ...newContact,
      id: Date.now().toString(),
    };
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
    <main className="p-3">
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
          data={contacts}
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
