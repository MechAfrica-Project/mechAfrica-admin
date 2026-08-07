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
          Send direct push notifications and SMS messages to the mobile applications and phones of farmers, service providers, or individual users.
        </p>
      </div>
      <BroadcastForm />
    </div>
  );
}
