"use client";

import React from "react";

import { Card } from "@/components/ui/card";
import SummaryCards from "./_components/SummaryCards";
import { RevenueChart } from "./_components/RevenueChart";

export default function RevenueAndPayment() {
  return (
    <div className="space-y-6 p-7">
      <SummaryCards />

      <Card className="p-6 bg-white">
        <RevenueChart />
      </Card>
    </div>
  );
}
