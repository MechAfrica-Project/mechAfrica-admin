"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { EffectiveMarketSettings, MarketPermission } from "@/lib/api/types";

interface ScopedRolloutFormProps {
  scopedEffective: EffectiveMarketSettings | null;
  hasPermission: (permission: MarketPermission) => boolean;
  onResolveScope: (cropId: string, regionId: string) => Promise<void>;
  onSaveOverride: (payload: {
    expected_version: number;
    scope: { crop_id?: string; region_id?: string };
    reason: string;
    effective_from: string;
    effective_to?: string;
    values: Record<string, unknown>;
  }) => Promise<void>;
  onCancelVersion: (versionId: string, expectedVersion: number, reason: string) => Promise<void>;
}

export function ScopedRolloutForm({
  scopedEffective,
  hasPermission,
  onResolveScope,
  onSaveOverride,
  onCancelVersion,
}: ScopedRolloutFormProps) {
  const canManageRollout = hasPermission("market.manage_crop_region_rollout");
  const current = scopedEffective?.current;
  const vals = current?.values ?? {};

  const [cropId, setCropId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [enabled, setEnabled] = useState(Boolean(vals.enabled));
  const [ussdEnabled, setUssdEnabled] = useState(Boolean(vals.ussd_enabled ?? vals.enabled));
  const [purchaseEnabled, setPurchaseEnabled] = useState(Boolean(vals.purchase_enabled ?? true));
  const [consignmentEnabled, setConsignmentEnabled] = useState(Boolean(vals.consignment_enabled));
  const [commissionCapEnabled, setCommissionCapEnabled] = useState(Boolean(vals.commission_cap_enabled ?? true));
  const [commissionRateBps, setCommissionRateBps] = useState(
    typeof vals.commission_rate_bps === "number" ? String(vals.commission_rate_bps) : "1000"
  );
  const [effectiveFrom, setEffectiveFrom] = useState("2026-11-20T00:00:00Z");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreview = async () => {
    setError(null);
    try {
      await onResolveScope(cropId.trim(), regionId.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve scoped policy");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!cropId.trim() && !regionId.trim()) {
      setError("Select at least a Crop UUID or Region UUID for a scoped rollout override.");
      return;
    }
    if (!reason.trim()) {
      setError("Administrative reason is required for scoped rollout.");
      return;
    }
    if (!effectiveFrom.trim().endsWith("Z")) {
      setError("Effective from date must be a valid UTC timestamp ending with Z.");
      return;
    }
    if (effectiveTo.trim() && !effectiveTo.trim().endsWith("Z")) {
      setError("Effective to date must be a valid UTC timestamp ending with Z.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveOverride({
        expected_version: current?.version ?? 0,
        scope: {
          crop_id: cropId.trim() || undefined,
          region_id: regionId.trim() || undefined,
        },
        reason: reason.trim(),
        effective_from: effectiveFrom.trim(),
        effective_to: effectiveTo.trim() || undefined,
        values: {
          enabled,
          ussd_enabled: ussdEnabled,
          purchase_enabled: purchaseEnabled,
          consignment_enabled: consignmentEnabled,
          commission_cap_enabled: commissionCapEnabled,
          commission_rate_bps: Number(commissionRateBps) || 0,
        },
      });
      setReason("");
      setStatusMessage("Scoped rollout override saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scoped override");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crop & Region Rollout Overrides</CardTitle>
        <CardDescription>
          Preview effective resolved policy and schedule crop or regional pilot overrides.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="scope-crop-id">Crop UUID (Optional)</Label>
              <Input
                id="scope-crop-id"
                aria-label="Crop UUID (Optional)"
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                placeholder="e.g. 00000000-0000-0000-0000-000000000001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scope-region-id">Region UUID (Optional)</Label>
              <Input
                id="scope-region-id"
                aria-label="Region UUID (Optional)"
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                placeholder="e.g. 00000000-0000-0000-0000-000000000002"
              />
            </div>
            <Button type="button" variant="outline" onClick={handlePreview}>
              Preview Effective Policy
            </Button>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 border text-sm space-y-1">
            <div className="font-medium">Resolved Effective Policy Preview</div>
            <div className="text-xs text-gray-600">
              Version: v{current?.version ?? 0} · Master: {vals.enabled ? "Enabled" : "Disabled"} · USSD:{" "}
              {vals.ussd_enabled ?? vals.enabled ? "Enabled" : "Disabled"} · Purchase:{" "}
              {vals.purchase_enabled ? "Enabled" : "Disabled"} · Consignment:{" "}
              {vals.consignment_enabled ? "Enabled" : "Disabled"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="scoped-master-toggle">Scoped Market Enabled</Label>
              <Switch
                id="scoped-master-toggle"
                aria-label="Scoped Market Enabled"
                checked={enabled}
                disabled={!canManageRollout}
                onCheckedChange={setEnabled}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="scoped-ussd-toggle">Scoped USSD Entry Enabled</Label>
              <Switch
                id="scoped-ussd-toggle"
                aria-label="Scoped USSD Entry Enabled"
                checked={ussdEnabled}
                disabled={!canManageRollout}
                onCheckedChange={setUssdEnabled}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="scoped-purchase-toggle">Scoped Agent Purchase</Label>
              <Switch
                id="scoped-purchase-toggle"
                aria-label="Scoped Agent Purchase"
                checked={purchaseEnabled}
                disabled={!canManageRollout}
                onCheckedChange={setPurchaseEnabled}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="scoped-consignment-toggle">Scoped Agent Consignment</Label>
              <Switch
                id="scoped-consignment-toggle"
                aria-label="Scoped Agent Consignment"
                checked={consignmentEnabled}
                disabled={!canManageRollout}
                onCheckedChange={setConsignmentEnabled}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="scoped-commission-cap-toggle">Scoped Commission Cap Enabled</Label>
              <Switch
                id="scoped-commission-cap-toggle"
                aria-label="Scoped Commission Cap Enabled"
                checked={commissionCapEnabled}
                disabled={!canManageRollout}
                onCheckedChange={setCommissionCapEnabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="scoped-rate-bps">Scoped Commission Rate (BPS)</Label>
              <Input
                id="scoped-rate-bps"
                aria-label="Scoped Commission Rate (BPS)"
                type="number"
                disabled={!canManageRollout}
                value={commissionRateBps}
                onChange={(e) => setCommissionRateBps(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scoped-effective-from">Scheduled Effective From (UTC)</Label>
              <Input
                id="scoped-effective-from"
                aria-label="Scheduled Effective From (UTC)"
                disabled={!canManageRollout}
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scoped-effective-to">Scheduled Effective To (UTC)</Label>
              <Input
                id="scoped-effective-to"
                aria-label="Scheduled Effective To (UTC)"
                disabled={!canManageRollout}
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="scoped-reason">Rollout Reason</Label>
            <Textarea
              id="scoped-reason"
              aria-label="Rollout Reason"
              disabled={!canManageRollout}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Document pilot scope and board approval..."
            />
          </div>

          {scopedEffective?.scheduled?.length ? (
            <div className="space-y-2 border-t pt-4">
              <div className="text-sm font-medium">Scheduled Versions for Scope</div>
              {scopedEffective.scheduled.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs border rounded p-2">
                  <span>
                    v{item.version} · {item.effective_from}
                  </span>
                  {canManageRollout && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onCancelVersion(item.id, item.version, reason.trim() || "Cancelled scheduled rollout")
                      }
                    >
                      Cancel Scheduled Version
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end">
          {canManageRollout ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Save Scoped Rollout"}
            </Button>
          ) : (
            <span className="text-xs text-amber-700">Read-only: missing crop/region rollout permission</span>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
