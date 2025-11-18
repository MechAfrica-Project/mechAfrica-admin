"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { ProviderListItem } from "../types";

interface Props {
  providers: ProviderListItem[];
  onProviderClick: (p: ProviderListItem) => void;
}

export function ProvidersTable({ providers, onProviderClick }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0">
          <thead className="bg-white">
            <tr className="text-left text-sm text-gray-600 border-t border-b border-gray-100">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Phone number</th>
              <th className="px-6 py-3">Date of Registration</th>
              <th className="px-6 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onProviderClick(p)}
              >
                <td className="px-6 py-4 align-top">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 ${p.color} rounded-full flex items-center justify-center text-white font-semibold`}
                    >
                      {p.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-500">{p.handle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 align-middle" />
                    {p.type}
                  </Badge>
                </td>
                <td className="px-6 py-4 align-top text-sm text-gray-700">
                  {p.phone}
                </td>
                <td className="px-6 py-4 align-top text-sm text-gray-700">
                  {p.registrationDate}
                </td>
                <td className="px-6 py-4 align-top text-right" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded ${
              i === 1
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}
