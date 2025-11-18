"use client";

import React from "react";

export default function ProviderDetailPage({ id }: { id: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
        <h3 className="text-lg font-semibold">Provider detail (mobile)</h3>
        <p className="text-sm text-gray-600 mt-2">Provider id: {id}</p>
      </div>
    </div>
  );
}
