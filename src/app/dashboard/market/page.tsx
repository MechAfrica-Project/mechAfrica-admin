"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { MarketOverview } from "./_components/MarketOverview";
import { GlobalControls } from "./_components/GlobalControls";
import { ScopedRolloutForm } from "./_components/ScopedRolloutForm";
import { AgentPolicies } from "./_components/AgentPolicies";
import { AuditHistory } from "./_components/AuditHistory";
import type {
  EffectiveMarketSettings,
  MarketAgentPolicy,
  MarketAuditEntry,
  MarketPermission,
} from "@/lib/api/types";

type MarketSection = "overview" | "global" | "rollout" | "agents" | "audit";

export default function MarketManagementPage() {
  const user = useAuthStore((s) => s.user);
  const [activeSection, setActiveSection] = useState<MarketSection>("overview");
  const [effective, setEffective] = useState<EffectiveMarketSettings | null>(null);
  const [scopedEffective, setScopedEffective] = useState<EffectiveMarketSettings | null>(null);
  const [history, setHistory] = useState<MarketAuditEntry[]>([]);
  const [agentPolicies, setAgentPolicies] = useState<MarketAgentPolicy[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const hasPermission = useCallback(
    (permission: MarketPermission): boolean => {
      if (!user) return false;
      const role = (user as { role?: string; admin_type?: string }).role ?? (user as { admin_type?: string }).admin_type;
      if (role === "super_admin") return true;
      const perms = (user as { permissions?: string[] }).permissions ?? [];
      return perms.includes(permission);
    },
    [user]
  );

  const loadWorkspace = useCallback(async () => {
    setLoadError(null);
    try {
      const [settingsRes, historyRes, agentsRes] = await Promise.all([
        api.getMarketSettings(),
        api.getMarketSettingsHistory(50),
        api.getMarketAgentPolicies(),
      ]);
      setEffective(settingsRes);
      setScopedEffective(settingsRes);
      setHistory(historyRes.items ?? []);
      setAgentPolicies(agentsRes.items ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load market settings");
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const makeIdempotencyKey = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Management</h1>
          <p className="text-sm text-gray-500">
            Database-driven controls for market master status, USSD entry, deal modes, commission caps, and regional rollout.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Market Management Sections">
          {(
            [
              ["overview", "Overview"],
              ["global", "Global Controls"],
              ["rollout", "Crop & Region Rollout"],
              ["agents", "Agent Policies"],
              ["audit", "Audit History"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeSection === id}
              variant={activeSection === id ? "default" : "outline"}
              onClick={() => setActiveSection(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {loadError}
        </div>
      )}

      {activeSection === "overview" && <MarketOverview effective={effective} history={history} />}

      {activeSection === "global" && (
        <GlobalControls
          effective={effective}
          hasPermission={hasPermission}
          onSave={async (payload) => {
            const res = await api.createMarketSettingsVersion(payload, makeIdempotencyKey("global"));
            setEffective(res.effective);
            await loadWorkspace();
          }}
        />
      )}

      {activeSection === "rollout" && (
        <ScopedRolloutForm
          scopedEffective={scopedEffective}
          hasPermission={hasPermission}
          onResolveScope={async (cropId, regionId) => {
            const res = await api.getEffectiveMarketPolicy(cropId || undefined, regionId || undefined);
            setScopedEffective(res);
          }}
          onSaveOverride={async (payload) => {
            const res = await api.createMarketSettingsVersion(payload, makeIdempotencyKey("scope"));
            setScopedEffective(res.effective);
            await loadWorkspace();
          }}
          onCancelVersion={async (versionId, expectedVersion, reason) => {
            const res = await api.cancelMarketSettingsVersion(
              versionId,
              { expected_version: expectedVersion, reason },
              makeIdempotencyKey("cancel")
            );
            setScopedEffective(res.effective);
            await loadWorkspace();
          }}
        />
      )}

      {activeSection === "agents" && (
        <AgentPolicies
          policies={agentPolicies}
          hasPermission={hasPermission}
          onSaveAgentPolicy={async (agentId, payload) => {
            await api.createMarketAgentPolicyVersion(agentId, payload, makeIdempotencyKey("agent"));
            await loadWorkspace();
          }}
        />
      )}

      {activeSection === "audit" && <AuditHistory entries={history} />}
    </div>
  );
}
