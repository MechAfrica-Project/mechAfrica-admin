"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useContactsStore } from "@/stores/useContactsStore";
import { api } from "@/lib/api";
import type { Provider, ProviderListItem } from "./types";
import { VerificationPanel } from "./_components/verification-panel";
import { ProvidersTable } from "./_components/providers-table";

export default function ProvidersPage() {
  const { setTitle, setFilters } = useHeaderStore();

  // Contacts store for providers
  const providers = useContactsStore((state) => state.providers);
  const isLoading = useContactsStore((state) => state.isLoading);
  const error = useContactsStore((state) => state.error);
  const fetchProviders = useContactsStore((state) => state.fetchProviders);
  const clearError = useContactsStore((state) => state.clearError);

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Fetch providers on mount
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Set page title and filters
  useEffect(() => {
    setTitle("Provider Verification");
    setFilters({});
  }, [setTitle, setFilters]);

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Generate a color based on name
  const getColor = (name: string): string => {
    const colors = ["#00594C", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Convert store provider to ProviderListItem format
  const providersList: ProviderListItem[] = providers.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.otherNames}`.trim(),
    handle: `@${p.firstName.toLowerCase()}`,
    initials: p.initials,
    type: "Service Provider",
    phone: p.phone,
    registrationDate: p.registrationDate,
    color: getColor(p.firstName),
  }));

  // Convert ProviderListItem → Provider for panel
  const handleProviderClick = (p: ProviderListItem) => {
    const provider: Provider = {
      id: p.id,
      name: p.name,
      email: `${p.handle.replace("@", "")}@example.com`,
      phone: p.phone,
      providerType: p.type,
      status: "pending",
      verified: false,
    };
    setSelectedProvider(provider);
  };

  // Handle verification action
  const handleVerify = async () => {
    if (!selectedProvider) return;

    try {
      await api.manageUser(selectedProvider.id, "verify");
      // Refresh providers list
      fetchProviders();
      setSelectedProvider(null);
    } catch (err) {
      console.error("Failed to verify provider:", err);
    }
  };

  // Handle decline action
  const handleDecline = async () => {
    if (!selectedProvider) return;

    try {
      await api.manageUser(selectedProvider.id, "unverify");
      // Refresh providers list
      fetchProviders();
      setSelectedProvider(null);
    } catch (err) {
      console.error("Failed to decline provider:", err);
    }
  };

  // Loading state
  if (isLoading && providers.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex">
        <main className="flex-1 p-6">
          <div className="max-w-full mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00594C] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading providers...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error && providers.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex">
        <main className="flex-1 p-6">
          <div className="max-w-full mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 font-medium mb-2">Failed to load providers</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button
                  onClick={() => fetchProviders()}
                  className="px-4 py-2 bg-[#00594C] text-white rounded-lg hover:bg-[#00594cd4] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex">
      <main className="flex-1 p-6">
        <div className="max-w-full mx-auto">
          {/* Error banner if there's an error but we have cached data */}
          {error && providers.length > 0 && (
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

          {/* Stats summary */}
          <div className="mb-4 flex gap-4 text-sm text-gray-600">
            <span>
              Total Providers: <strong>{providers.length}</strong>
            </span>
            <span>
              Pending Verification:{" "}
              <strong>{providers.filter((p) => !p.profileImage).length}</strong>
            </span>
          </div>

          <ProvidersTable providers={providersList} onProviderClick={handleProviderClick} />
        </div>
      </main>

      <AnimatePresence>
        {selectedProvider && (
          <VerificationPanel
            provider={selectedProvider}
            onClose={() => setSelectedProvider(null)}
            onDecline={handleDecline}
            onVerify={handleVerify}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
