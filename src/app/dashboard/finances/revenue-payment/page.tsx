"use client";

import React, { useEffect } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { Card } from "@/components/ui/card";
import SummaryCards from "./_components/SummaryCards";
import { RevenueChart } from "./_components/RevenueChart";

export default function RevenueAndPayment() {
  const { setTitle, setFilters } = useHeaderStore();

  useEffect(() => {
    setTitle("Revenue & Payment");
    setFilters({});
  }, [setTitle, setFilters]);

  return (
    <div className="space-y-6 p-7">
      <SummaryCards />

      <Card className="p-6 bg-white">
        <RevenueChart />
      </Card>
    </div>
  );
}
