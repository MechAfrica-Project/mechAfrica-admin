"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { MarketAgentPolicy, MarketPermission } from "@/lib/api/types";

interface AgentPoliciesProps {
  policies: MarketAgentPolicy[];
  hasPermission: (permission: MarketPermission) => boolean;
  onSaveAgentPolicy: (
    agentId: string,
    payload: {
      expected_version: number;
      reason: string;
      effective_from: string;
      effective_to?: string;
      policy: MarketAgentPolicy;
    }
  ) => Promise<void>;
}

export function AgentPolicies({ policies, hasPermission, onSaveAgentPolicy }: AgentPoliciesProps) {
  const canManageAgents = hasPermission("market.manage_agent_policies");

  const [agentId, setAgentId] = useState("");
  const [expectedVersion, setExpectedVersion] = useState("0");
  const [role, setRole] = useState<"sales_agent" | "aggregator">("sales_agent");
  const [purchasePermitted, setPurchasePermitted] = useState(true);
  const [consignmentPermitted, setConsignmentPermitted] = useState(false);
  const [exposureCapMinor, setExposureCapMinor] = useState("500000");
  const [commissionParticipant, setCommissionParticipant] = useState(true);
  const [suspended, setSuspended] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState("2026-11-19T12:00:00Z");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!agentId.trim()) {
      setError("Agent UUID is required.");
      return;
    }
    if (!reason.trim()) {
      setError("Administrative reason is required.");
      return;
    }

    const permittedModes = [
      purchasePermitted ? "agent_purchase" : null,
      consignmentPermitted ? "agent_consignment" : null,
    ].filter(Boolean) as string[];

    try {
      await onSaveAgentPolicy(agentId.trim(), {
        expected_version: Number(expectedVersion) || 0,
        reason: reason.trim(),
        effective_from: effectiveFrom.trim(),
        policy: {
          agent_id: agentId.trim(),
          version: (Number(expectedVersion) || 0) + 1,
          eligibility: role,
          permitted_modes: permittedModes,
          exposure_cap_minor: Number(exposureCapMinor) || 0,
          commission_participant: commissionParticipant,
          suspended,
        },
      });
      setReason("");
      setStatusMessage("Agent market policy version saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save agent policy");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Agent Market Policies</CardTitle>
          <CardDescription>
            Per-agent role eligibility, permitted deal modes, unsettled exposure caps, and suspension state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length ? (
            <div className="space-y-3">
              {policies.map((p) => (
                <div key={p.agent_id} className="flex flex-wrap items-center justify-between border rounded-lg p-3 text-sm gap-2">
                  <div>
                    <div className="font-medium">Agent {p.agent_id}</div>
                    <div className="text-xs text-gray-500">
                      Role: {p.eligibility} · Modes: {(p.permitted_modes ?? []).join(", ") || "None"} · Exposure Cap: GHS{" "}
                      {(p.exposure_cap_minor / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.suspended ? "destructive" : "default"}>
                      {p.suspended ? "Suspended" : `v${p.version} Active`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No agent policies configured yet.</p>
          )}
        </CardContent>
      </Card>

      {canManageAgents && (
        <Card>
          <CardHeader>
            <CardTitle>Update Agent Market Policy</CardTitle>
            <CardDescription>Create a new audited policy version for an appointed market agent.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              {statusMessage && (
                <div role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
                  {statusMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="agent-policy-id">Agent UUID</Label>
                  <Input
                    id="agent-policy-id"
                    aria-label="Agent UUID"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agent-expected-version">Expected Version</Label>
                  <Input
                    id="agent-expected-version"
                    aria-label="Expected Version"
                    type="number"
                    value={expectedVersion}
                    onChange={(e) => setExpectedVersion(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agent-exposure-cap">Exposure Cap (Pesewas)</Label>
                  <Input
                    id="agent-exposure-cap"
                    aria-label="Exposure Cap (Pesewas)"
                    type="number"
                    value={exposureCapMinor}
                    onChange={(e) => setExposureCapMinor(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="agent-role-aggregator">Aggregator Role Eligibility</Label>
                  <Switch
                    id="agent-role-aggregator"
                    aria-label="Aggregator Role Eligibility"
                    checked={role === "aggregator"}
                    onCheckedChange={(checked) => setRole(checked ? "aggregator" : "sales_agent")}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="agent-purchase-mode">Permit Agent Purchase</Label>
                  <Switch
                    id="agent-purchase-mode"
                    aria-label="Permit Agent Purchase"
                    checked={purchasePermitted}
                    onCheckedChange={setPurchasePermitted}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="agent-consignment-mode">Permit Agent Consignment</Label>
                  <Switch
                    id="agent-consignment-mode"
                    aria-label="Permit Agent Consignment"
                    checked={consignmentPermitted}
                    onCheckedChange={setConsignmentPermitted}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="agent-commission-participant">Follow Commission Cap</Label>
                  <Switch
                    id="agent-commission-participant"
                    aria-label="Follow Commission Cap"
                    checked={commissionParticipant}
                    onCheckedChange={setCommissionParticipant}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="agent-suspended">Suspend Agent Market Operations</Label>
                  <Switch
                    id="agent-suspended"
                    aria-label="Suspend Agent Market Operations"
                    checked={suspended}
                    onCheckedChange={setSuspended}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agent-effective-from">Effective From (UTC)</Label>
                  <Input
                    id="agent-effective-from"
                    aria-label="Agent Effective From (UTC)"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="agent-policy-reason">Administrative Reason</Label>
                <Textarea
                  id="agent-policy-reason"
                  aria-label="Agent Policy Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit">Save Agent Policy</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
