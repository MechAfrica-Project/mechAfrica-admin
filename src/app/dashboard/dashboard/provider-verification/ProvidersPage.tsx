"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { providersSeed } from "./data/providers-data";
import type { Provider, ProviderListItem } from "./types";
import { VerificationPanel } from "./_components/verification-panel";
import { ProvidersTable } from "./_components/providers-table";

export default function ProvidersPage() {
  const [providers] = useState<ProviderListItem[]>(providersSeed);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set()); // start empty
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    const allIds = providers.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedRows.has(id));

    if (allSelected) {
      setSelectedRows(new Set()); // deselect all
    } else {
      setSelectedRows(new Set(allIds)); // select all
    }
  };

  // Convert ProviderListItem → Provider
  const handleProviderClick = (p: ProviderListItem) => {
    const provider: Provider = {
      id: p.id,
      name: p.name,
      email: "", // TODO: add real email if available
      phone: p.phone,
      providerType: p.type,
      status: "pending",
      verified: false,
    };
    setSelectedProvider(provider);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex">
      <main className="flex-1 p-6">
        <div className="max-w-full mx-auto">
          <ProvidersTable
            providers={providers}
            onProviderClick={handleProviderClick}
          />
        </div>
      </main>

      <AnimatePresence>
        {selectedProvider && (
          <VerificationPanel
            provider={selectedProvider}
            onClose={() => setSelectedProvider(null)}
            onDecline={() => setSelectedProvider(null)}
            onVerify={() => setSelectedProvider(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
