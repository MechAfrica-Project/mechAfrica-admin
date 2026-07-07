"use client";

import React, { useEffect } from "react";
import BroadcastForm from "./_components/BroadcastForm";
import { useHeaderStore } from "@/stores/useHeaderStore";

export default function BroadcastNotificationsPage() {
  const { setTitle } = useHeaderStore();

  useEffect(() => {
    setTitle("Broadcast Push Notifications");
  }, [setTitle]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-gray-500">
          Send direct push notifications to the mobile applications of farmers and service providers.
        </p>
      </div>
      <BroadcastForm />
    </div>
  );
}
