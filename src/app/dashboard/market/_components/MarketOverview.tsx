"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EffectiveMarketSettings, MarketAuditEntry } from "@/lib/api/types";

interface MarketOverviewProps {
  effective: EffectiveMarketSettings | null;
  history: MarketAuditEntry[];
}

export function MarketOverview({ effective, history }: MarketOverviewProps) {
  const current = effective?.current;
  const values = current?.values ?? {};
  const enabled = Boolean(values.enabled);
  const ussdEnabled = Boolean(values.ussd_enabled ?? values.enabled);
  const purchaseEnabled = Boolean(values.purchase_enabled);
  const consignmentEnabled = Boolean(values.consignment_enabled);
  const commissionCapEnabled = Boolean(values.commission_cap_enabled);
  const rateBps = typeof values.commission_rate_bps === "number" ? values.commission_rate_bps : null;
  const perKgMinor = typeof values.commission_minor_per_kg === "number" ? values.commission_minor_per_kg : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Market Master Status</CardDescription>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{enabled ? "Enabled" : "Disabled"}</span>
              <Badge variant={enabled ? "default" : "secondary"}>
                v{current?.version ?? 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            Controls new listings, buyer leads, and market creation while existing deals continue.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Market USSD Entry</CardDescription>
            <CardTitle className="text-lg">
              {ussdEnabled ? "USSD Open" : "USSD Entry Closed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            Blocks new Sell/Buy USSD entry when disabled while preserving pending confirmations.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Permitted Deal Modes</CardDescription>
            <CardTitle className="text-lg">
              {[purchaseEnabled && "Agent Purchase", consignmentEnabled && "Agent Consignment"]
                .filter(Boolean)
                .join(", ") || "None"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            Active global default modes before crop/region or agent policy checks.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Commission Policy</CardDescription>
            <CardTitle className="text-lg">
              {commissionCapEnabled ? "Cap Enforced" : "Negotiated"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            {commissionCapEnabled
              ? `Rate cap: ${rateBps !== null ? `${(rateBps / 100).toFixed(2)}%` : "—"} · Per-kg cap: ${
                  perKgMinor !== null ? `GHS ${(perKgMinor / 100).toFixed(2)}` : "—"
                }`
              : "Agents and farmers negotiate commission per deal."}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scheduled Policy Changes</CardTitle>
            <CardDescription>Upcoming policy versions queued for automatic UTC activation</CardDescription>
          </CardHeader>
          <CardContent>
            {effective?.scheduled?.length ? (
              <ul className="space-y-2 text-sm">
                {effective.scheduled.map((item) => (
                  <li key={item.id} className="flex items-center justify-between border-b pb-2">
                    <span>
                      Version v{item.version} · Effective {item.effective_from}
                    </span>
                    <Badge variant="outline">Scheduled</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No scheduled policy changes.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Policy Activity</CardTitle>
            <CardDescription>Latest audited configuration updates</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length ? (
              <ul className="space-y-2 text-sm">
                {history.slice(0, 4).map((entry) => (
                  <li key={entry.id} className="border-b pb-2">
                    <div className="font-medium">{entry.reason}</div>
                    <div className="text-xs text-gray-500">
                      {entry.permission} · {entry.created_at}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No recent policy activity recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
