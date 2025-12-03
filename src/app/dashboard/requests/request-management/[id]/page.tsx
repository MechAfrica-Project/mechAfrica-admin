import React from "react";
import { Card } from "@/components/ui/card";
import RequestsTable from "../_components/RequestsTable";
import Link from "next/link";

const labelMap: Record<string, string> = {
  new: "New Requests",
  ongoing: "On-going Requests",
  completed: "Completed",
  cancelled: "Cancelled",
  provider: "Provider Requests",
  demand: "Demand to Supply",
};

export default function RequestsByCategory({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const title = labelMap[id] ?? "Requests";

  return (
    <div className="space-y-6 p-7">
      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-gray-500">
              Listing for <strong>{id}</strong>
            </p>
          </div>
          <div>
            <Link
              href="/dashboard/requests/request-management"
              className="text-sm bg-green-800 hover:bg-green-700 text-white p-2 px-3 rounded-md"
            >
              Back
            </Link>
          </div>
        </div>

        <RequestsTable filter={id} />
      </Card>
    </div>
  );
}
