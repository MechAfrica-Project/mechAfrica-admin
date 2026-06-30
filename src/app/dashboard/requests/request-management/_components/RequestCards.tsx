"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDashboardStore } from "@/stores/useDashboardStore";

type CardDef = {
  id: string;
  title: string;
  count: number;
  delta?: string;
  bg?: string;
};

export default function RequestCards({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const serviceStats = useDashboardStore((state) => state.rawDashboardData?.service_stats);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);
  const userStats = useDashboardStore((state) => state.rawDashboardData?.user_stats);

  // Fetch dashboard data on mount to get service stats
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Use actual backend stats (falling back to 0 if not loaded yet)
  const newRequests = serviceStats?.pending || 0;
  const newRequestsDelta = serviceStats?.pending_requests_growth || "+0%";
  
  const ongoingRequests = serviceStats?.in_progress || 0;
  // NOTE: the backend only groups "pending, accepted, in_progress" into pending requests, 
  // so for ongoing we will just use pending_requests_growth or +0% for now.
  const ongoingRequestsDelta = serviceStats?.pending_requests_growth || "+0%";
  
  const completedRequests = serviceStats?.completed || 0;
  const completedRequestsDelta = serviceStats?.completed_requests_growth || "+0%";
  
  const cancelledRequests = serviceStats?.cancelled || 0;
  const cancelledRequestsDelta = serviceStats?.cancelled_requests_growth || "+0%";
  
  const totalRequests = serviceStats?.total_requests || 0;
  const totalRequestsDelta = serviceStats?.total_requests_growth || "+0%";

  // Calculate demand to supply using real provider totals from userStats
  const totalProviders = userStats?.service_providers?.total || 0;
  const demandToSupply = totalProviders > 0 ? Math.round(totalRequests / totalProviders) : 0;
  const demandToSupplyDelta = totalRequestsDelta; // Proxy using total requests growth

  const cards: CardDef[] = [
    {
      id: "new",
      title: "New Requests",
      count: newRequests,
      delta: newRequestsDelta,
      bg: "bg-yellow-50",
    },
    {
      id: "ongoing",
      title: "On-going Requests",
      count: ongoingRequests,
      delta: ongoingRequestsDelta,
      bg: "bg-white",
    },
    {
      id: "completed",
      title: "Completed",
      count: completedRequests,
      delta: completedRequestsDelta,
      bg: "bg-white",
    },
    {
      id: "cancelled",
      title: "Cancelled",
      count: cancelledRequests,
      delta: cancelledRequestsDelta,
      bg: "bg-white",
    },
    {
      id: "provider",
      title: "Provider Requests",
      count: totalRequests,
      delta: totalRequestsDelta,
      bg: "bg-white",
    },
    {
      id: "demand",
      title: "Demand to Supply",
      count: demandToSupply,
      delta: demandToSupplyDelta,
      bg: "bg-white",
    },
  ];

  // Loading state
  if (isLoading && !serviceStats) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => {
        const card = (
          <div
            className={`${c.bg} rounded-lg border border-gray-100 p-4 cursor-pointer transition-shadow hover:shadow-md ${selected === c.id ? "ring-2 ring-indigo-300" : ""
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{c.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {c.count}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm ${c.delta?.startsWith("-") ? "text-red-500" : "text-green-500"
                    }`}
                >
                  {c.delta}
                </span>
                <p className="text-xs text-gray-400">From last month</p>
              </div>
            </div>
          </div>
        );

        if (onSelect) {
          return (
            <div key={c.id} onClick={() => onSelect(c.id)}>
              {card}
            </div>
          );
        }

        return (
          <Link
            key={c.id}
            href={`/dashboard/requests/request-management/${c.id}`}
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}
