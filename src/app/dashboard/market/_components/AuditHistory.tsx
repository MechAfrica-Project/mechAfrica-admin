"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { MarketAuditEntry } from "@/lib/api/types";

interface AuditHistoryProps {
  entries: MarketAuditEntry[];
}

export function AuditHistory({ entries }: AuditHistoryProps) {
  const [filter, setFilter] = useState("");

  const filtered = entries.filter((entry) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.reason.toLowerCase().includes(q) ||
      entry.permission.toLowerCase().includes(q) ||
      entry.actor_id.toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Immutable Policy Audit History</CardTitle>
            <CardDescription>
              Every toggle, commission update, rollout override, and agent policy change with actor and reason.
            </CardDescription>
          </div>
          <Input
            aria-label="Filter audit history"
            placeholder="Filter by reason, permission, or actor..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length ? (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.reason}</span>
                  <Badge variant="outline">{entry.permission}</Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Actor: {entry.actor_id} · Scope:{" "}
                  {entry.scope.crop_id || entry.scope.region_id
                    ? `crop=${entry.scope.crop_id ?? "*"} region=${entry.scope.region_id ?? "*"}`
                    : "global"}{" "}
                  · Effective: {entry.effective_from}
                  {entry.effective_to ? ` → ${entry.effective_to}` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No matching audit entries.</p>
        )}
      </CardContent>
    </Card>
  );
}
