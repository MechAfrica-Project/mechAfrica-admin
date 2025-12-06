"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRequestsStore } from "@/stores/useRequestsStore";

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
  const requests = useRequestsStore((state) => state.requests);
  const isLoading = useRequestsStore((state) => state.isLoading);
  const fetchRequests = useRequestsStore((state) => state.fetchRequests);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Calculate counts from actual data
  const newRequests = requests.filter((r) => r.status === "Wait").length;
  const ongoingRequests = requests.filter((r) => r.status === "Ongoing" || r.status === "Active").length;
  const completedRequests = requests.filter((r) => r.status === "Completed").length;
  const cancelledRequests = requests.filter((r) => r.status === "Cancelled").length;
  const totalRequests = requests.length;

  // Calculate demand to supply (placeholder - would need provider data)
  const demandToSupply = totalRequests > 0 ? Math.round(totalRequests / 10) : 0;

  const cards: CardDef[] = [
    {
      id: "new",
      title: "New Requests",
      count: newRequests,
      delta: "+0%",
      bg: "bg-yellow-50",
    },
    {
      id: "ongoing",
      title: "On-going Requests",
      count: ongoingRequests,
      delta: "+0%",
      bg: "bg-white",
    },
    {
      id: "completed",
      title: "Completed",
      count: completedRequests,
      delta: "+0%",
      bg: "bg-white",
    },
    {
      id: "cancelled",
      title: "Cancelled",
      count: cancelledRequests,
      delta: "+0%",
      bg: "bg-white",
    },
    {
      id: "provider",
      title: "Provider Requests",
      count: totalRequests,
      delta: "+0%",
      bg: "bg-white",
    },
    {
      id: "demand",
      title: "Demand to Supply",
      count: demandToSupply,
      delta: "+0%",
      bg: "bg-white",
    },
  ];

  // Loading state
  if (isLoading && requests.length === 0) {
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
