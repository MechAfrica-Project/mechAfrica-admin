"use client";

import { use } from "react";
import ProviderDetailPage from "../_components/ProviderDetailsPage";

export default function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProviderDetailPage id={id} />;
}
