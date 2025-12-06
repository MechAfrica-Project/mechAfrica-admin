"use client";

import React, { useEffect } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { Card } from "@/components/ui/card";
import RequestCards from "./_components/RequestCards";
import RequestChart from "./_components/RequestChart";

export default function RequestManagementPage() {
  const { setTitle, setFilters } = useHeaderStore();

  useEffect(() => {
    setTitle("Request Management");
    setFilters({});
  }, [setTitle, setFilters]);

  return (
    <div className="space-y-6 p-7">
      <RequestCards />

      <Card className="p-6 bg-white">
        <RequestChart />
      </Card>
    </div>
  );
}
