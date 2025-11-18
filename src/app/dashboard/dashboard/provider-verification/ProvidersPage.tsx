"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { providersSeed } from "./data/providers-data";
import type { Provider, ProviderListItem } from "./types";
import { VerificationPanel } from "./_components/verification-panel";
import { ProvidersTable } from "./_components/providers-table";

export default function ProvidersPage() {
  const [providers] = useState<ProviderListItem[]>(providersSeed);
  // selection state removed: not used by current table implementation
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );


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
