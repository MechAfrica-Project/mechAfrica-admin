"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import RequestCards from "./_components/RequestCards";
import RequestChart from "./_components/RequestChart";

export default function RequestManagementPage() {
  return (
    <div className="space-y-6 p-7">
      <RequestCards />

      <Card className="p-6 bg-white">
        <RequestChart />
      </Card>
    </div>
  );
}
