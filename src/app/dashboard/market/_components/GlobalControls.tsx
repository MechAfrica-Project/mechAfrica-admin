"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { EffectiveMarketSettings, MarketPermission } from "@/lib/api/types";

interface GlobalControlsProps {
  effective: EffectiveMarketSettings | null;
  hasPermission: (permission: MarketPermission) => boolean;
  onSave: (payload: {
    expected_version: number;
    reason: string;
    effective_from: string;
    effective_to?: string;
    values: Record<string, unknown>;
  }) => Promise<void>;
}

export function GlobalControls({ effective, hasPermission, onSave }: GlobalControlsProps) {
  const current = effective?.current;
  const currentValues = current?.values ?? {};

  const [enabled, setEnabled] = useState(Boolean(currentValues.enabled));
  const [ussdEnabled, setUssdEnabled] = useState(Boolean(currentValues.ussd_enabled ?? currentValues.enabled));
  const [purchaseEnabled, setPurchaseEnabled] = useState(Boolean(currentValues.purchase_enabled ?? true));
  const [consignmentEnabled, setConsignmentEnabled] = useState(Boolean(currentValues.consignment_enabled));
  const [commissionCapEnabled, setCommissionCapEnabled] = useState(Boolean(currentValues.commission_cap_enabled ?? true));
  const [commissionRateBps, setCommissionRateBps] = useState(
    typeof currentValues.commission_rate_bps === "number" ? String(currentValues.commission_rate_bps) : "1000"
  );
  const [commissionMinorPerKg, setCommissionMinorPerKg] = useState(
    typeof currentValues.commission_minor_per_kg === "number" ? String(currentValues.commission_minor_per_kg) : ""
  );
  const [effectiveFrom, setEffectiveFrom] = useState("2026-11-19T12:00:00Z");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const vals = effective?.current?.values ?? {};
    setEnabled(Boolean(vals.enabled));
    setUssdEnabled(Boolean(vals.ussd_enabled ?? vals.enabled));
    setPurchaseEnabled(Boolean(vals.purchase_enabled ?? true));
    setConsignmentEnabled(Boolean(vals.consignment_enabled));
    setCommissionCapEnabled(Boolean(vals.commission_cap_enabled ?? true));
    if (typeof vals.commission_rate_bps === "number") {
      setCommissionRateBps(String(vals.commission_rate_bps));
    }
    if (typeof vals.commission_minor_per_kg === "number") {
      setCommissionMinorPerKg(String(vals.commission_minor_per_kg));
    }
  }, [effective]);

  const canMaster = hasPermission("market.manage_master_toggle");
  const canUssd = hasPermission("market.manage_ussd_toggle");
  const canModes = hasPermission("market.manage_deal_modes");
  const canCommission = hasPermission("market.manage_commission_policy");
  const canAnyWrite = canMaster || canUssd || canModes || canCommission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!reason.trim()) {
      setError("Administrative reason is required.");
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
    if (effectiveTo.trim() && new Date(effectiveTo) <= new Date(effectiveFrom)) {
      setError("Effective to date must be after effective from date.");
      return;
    }

    const values: Record<string, unknown> = {};
    if (canMaster) values.enabled = enabled;
    if (canUssd) values.ussd_enabled = ussdEnabled;
    if (canModes) {
      values.purchase_enabled = purchaseEnabled;
      values.consignment_enabled = consignmentEnabled;
    }
    if (canCommission) {
      values.commission_cap_enabled = commissionCapEnabled;
      const rateNum = Number(commissionRateBps);
      if (commissionRateBps.trim() !== "") {
        if (Number.isNaN(rateNum) || rateNum < 0 || rateNum > 10000) {
          setError("Commission rate must be between 0 and 10000 basis points.");
          return;
        }
        values.commission_rate_bps = rateNum;
      }
      if (commissionMinorPerKg.trim() !== "") {
        const capNum = Number(commissionMinorPerKg);
        if (Number.isNaN(capNum) || capNum < 0) {
          setError("Per-kilogram commission cap must be non-negative.");
          return;
        }
        values.commission_minor_per_kg = capNum;
      }
    }

    try {
      setIsSubmitting(true);
      await onSave({
        expected_version: current?.version ?? 0,
        reason: reason.trim(),
        effective_from: effectiveFrom.trim(),
        effective_to: effectiveTo.trim() || undefined,
        values,
      });
      setReason("");
      setStatusMessage("Global market policy version saved.");
    } catch (err) {
      const code = err instanceof Error ? err.message : "market_settings_error";
      if (code === "stale_version") {
        setError("Version conflict: settings were updated by another administrator. Refresh and retry.");
      } else {
        setError(`Failed to save policy (${code}).`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Market Controls</CardTitle>
        <CardDescription>
          Manage global defaults for market availability, USSD entry, deal modes, and commission caps.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="master-toggle" className="font-medium">Market Master Toggle</Label>
                <p className="text-xs text-gray-500">Enable or disable new market listings, leads, and deal creation.</p>
              </div>
              <Switch
                id="master-toggle"
                aria-label="Market Master Toggle"
                checked={enabled}
                disabled={!canMaster}
                onCheckedChange={setEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="ussd-toggle" className="font-medium">Market USSD Toggle</Label>
                <p className="text-xs text-gray-500">Enable or disable new Sell/Buy USSD entry menus.</p>
              </div>
              <Switch
                id="ussd-toggle"
                aria-label="Market USSD Toggle"
                checked={ussdEnabled}
                disabled={!canUssd}
                onCheckedChange={setUssdEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="purchase-toggle" className="font-medium">Agent Purchase Mode</Label>
                <p className="text-xs text-gray-500">Allow agent purchase deals where agents pay at pickup.</p>
              </div>
              <Switch
                id="purchase-toggle"
                aria-label="Agent Purchase Mode"
                checked={purchaseEnabled}
                disabled={!canModes}
                onCheckedChange={setPurchaseEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="consignment-toggle" className="font-medium">Agent Consignment Mode</Label>
                <p className="text-xs text-gray-500">Allow verified aggregator consignment deals within exposure caps.</p>
              </div>
              <Switch
                id="consignment-toggle"
                aria-label="Agent Consignment Mode"
                checked={consignmentEnabled}
                disabled={!canModes}
                onCheckedChange={setConsignmentEnabled}
              />
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="commission-cap-toggle" className="font-medium">Commission Cap Policy</Label>
                <p className="text-xs text-gray-500">When disabled, agents and farmers negotiate commission per deal.</p>
              </div>
              <Switch
                id="commission-cap-toggle"
                aria-label="Commission Cap Policy"
                checked={commissionCapEnabled}
                disabled={!canCommission}
                onCheckedChange={setCommissionCapEnabled}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="commission-rate-bps">Max Commission Rate (BPS)</Label>
                <Input
                  id="commission-rate-bps"
                  aria-label="Max Commission Rate (BPS)"
                  type="number"
                  disabled={!canCommission}
                  value={commissionRateBps}
                  onChange={(e) => setCommissionRateBps(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commission-minor-per-kg">Max Commission Per Kg (Pesewas)</Label>
                <Input
                  id="commission-minor-per-kg"
                  aria-label="Max Commission Per Kg (Pesewas)"
                  type="number"
                  disabled={!canCommission}
                  value={commissionMinorPerKg}
                  onChange={(e) => setCommissionMinorPerKg(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="global-effective-from">Effective From (UTC)</Label>
              <Input
                id="global-effective-from"
                aria-label="Effective From (UTC)"
                disabled={!canAnyWrite}
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="global-effective-to">Effective To (UTC, Optional)</Label>
              <Input
                id="global-effective-to"
                aria-label="Effective To (UTC, Optional)"
                disabled={!canAnyWrite}
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                placeholder="Optional expiry"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="global-reason">Administrative Reason</Label>
            <Textarea
              id="global-reason"
              aria-label="Administrative Reason"
              disabled={!canAnyWrite}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this policy change is being made..."
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-xs text-gray-500">Expected version: v{current?.version ?? 0}</span>
          {canAnyWrite ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Global Policy"}
            </Button>
          ) : (
            <span className="text-xs text-amber-700">Read-only: missing global management permission</span>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
