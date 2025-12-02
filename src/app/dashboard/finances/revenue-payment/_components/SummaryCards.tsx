"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  Repeat,
  Percent,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useFinancesData } from "./useFinancesData";

function StatCard({
  title,
  value,
  delta,
  icon,
  highlight = false,
}: {
  title: string;
  value: string;
  delta?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  const deltaIsPositive = delta ? delta.trim().startsWith("+") : false;
  return (
    <Card
      className={
        "p-4 " +
        (highlight ? "border-2 border-green-200 shadow-md bg-green-50" : "")
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={
              "rounded-md p-2 " +
              (highlight
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700")
            }
          >
            {icon}
          </div>
          {delta ? (
            <span
              className={
                "text-xs font-medium " +
                (deltaIsPositive ? "text-green-600" : "text-red-600")
              }
            >
              {deltaIsPositive ? (
                <ArrowUp className="inline-block w-3 h-3 mr-1" />
              ) : (
                <ArrowDown className="inline-block w-3 h-3 mr-1" />
              )}
              {delta}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function SummaryCards() {
  const { data } = useFinancesData();

  const stats = data?.summary ?? {
    revenue: { value: "¢324,353", delta: "+11.01%" },
    withdrawals: { value: "¢324,353", delta: "-0.03%" },
    payments: { value: "¢324,353", delta: "+15.03%" },
    commission: { value: "¢324,353", delta: "+6.08%" },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Revenue"
        value={stats.revenue.value}
        delta={stats.revenue.delta}
        icon={<DollarSign className="w-5 h-5" />}
      />

      <StatCard
        title="Withdrawals"
        value={stats.withdrawals.value}
        delta={stats.withdrawals.delta}
        icon={<Repeat className="w-5 h-5" />}
      />

      <StatCard
        title="Payments"
        value={stats.payments.value}
        delta={stats.payments.delta}
        icon={<TrendingUp className="w-5 h-5" />}
      />

      <StatCard
        title="Commission"
        value={stats.commission.value}
        delta={stats.commission.delta}
        icon={<Percent className="w-5 h-5" />}
      />
    </div>
  );
}
