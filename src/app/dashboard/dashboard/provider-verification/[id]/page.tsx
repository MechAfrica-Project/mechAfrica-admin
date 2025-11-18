"use client";

import ProviderDetailPage from "../_components/ProviderDetailsPage";

export default function ProviderPage({ params }: { params: { id: string } }) {
  return <ProviderDetailPage id={params.id} />;
}
