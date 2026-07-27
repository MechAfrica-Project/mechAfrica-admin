"use client";

import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { MapMarkerData, regionToCoordinates } from "@/lib/geoUtils";
import { api } from "@/lib/api";
import type { FrontendContact } from "@/lib/api";

// ─── Config ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 1000;
const CONCURRENCY = 5; // Fetch up to 5 large pages in parallel
const MAX_RETRIES = 2;

// ─── Transform contact → marker ────────────────────────────────────────────

function contactToMarker(
  contact: FrontendContact,
  type: "farmer" | "service_provider"
): MapMarkerData {
  return {
    id: contact.id,
    type,
    position: regionToCoordinates(contact.region, contact.id),
    name: `${contact.firstName} ${contact.otherNames}`.trim(),
    region: contact.region || "Unknown",
    district: contact.district || "",
    phone: contact.phone,
    ...(type === "farmer" && {
      crops: contact.crops ?? [],
      farmSize: contact.farmSize ?? 0,
    }),
    ...(type === "service_provider" && {
      services: contact.services ?? [],
    }),
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMapData() {
  const statistics = useDashboardStore((state) => state.statistics);
  const dashboardLoading = useDashboardStore((state) => state.isLoading);
  const dashboardError = useDashboardStore((state) => state.error);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

  const [farmerMarkers, setFarmerMarkers] = useState<MapMarkerData[]>([]);
  const [providerMarkers, setProviderMarkers] = useState<MapMarkerData[]>([]);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [totalProviders, setTotalProviders] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetched = useRef(false);
  const abortRef = useRef(false);

  // ── Parallel paginated fetcher with retry ──────────────────────────────
  const fetchProgressively = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    abortRef.current = false;

    setFarmerMarkers([]);
    setProviderMarkers([]);

    const fetchRole = async (
      role: "farmer" | "service_provider",
      fetchFn: (p: number, l: number) => ReturnType<typeof api.getFarmers>,
      onChunk: (newMarkers: MapMarkerData[]) => void,
      onTotal: (total: number) => void
    ) => {
      try {
        // Step 1: Fetch page 1 to discover totalPages
        const firstResponse = await fetchFn(1, PAGE_SIZE);
        if (!firstResponse.success || !firstResponse.data.length) return;

        const total = firstResponse.pagination?.total ?? 0;
        const totalPages = firstResponse.pagination?.totalPages ?? 1;
        onTotal(total);

        // Render first page immediately
        const firstChunk = firstResponse.data.map((c) => contactToMarker(c, role));
        onChunk(firstChunk);

        if (totalPages <= 1 || abortRef.current) return;

        // Step 2: Build remaining page numbers to fetch all pages progressively
        const remainingPages: number[] = [];
        for (let p = 2; p <= totalPages; p++) {
          remainingPages.push(p);
        }

        // Step 3: Fetch in parallel batches with retry for failed pages
        let pagesToFetch = remainingPages;
        let retryAttempt = 0;

        while (pagesToFetch.length > 0 && retryAttempt <= MAX_RETRIES) {
          if (abortRef.current) break;

          const failedPages: number[] = [];
          const batchSize = retryAttempt === 0 ? CONCURRENCY : 3;

          for (let i = 0; i < pagesToFetch.length; i += batchSize) {
            if (abortRef.current) break;

            const batch = pagesToFetch.slice(i, i + batchSize);
            const results = await Promise.allSettled(
              batch.map((page) => fetchFn(page, PAGE_SIZE))
            );

            const batchMarkers: MapMarkerData[] = [];
            for (let j = 0; j < results.length; j++) {
              const result = results[j];
              if (
                result.status === "fulfilled" &&
                result.value.success &&
                result.value.data.length > 0
              ) {
                batchMarkers.push(
                  ...result.value.data.map((c) => contactToMarker(c, role))
                );
              } else {
                failedPages.push(batch[j]);
              }
            }

            if (batchMarkers.length > 0) {
              onChunk(batchMarkers);
            }
          }

          // Retry failed pages with a brief delay
          if (failedPages.length > 0 && retryAttempt < MAX_RETRIES) {
            console.log(
              `[MapData] Retrying ${failedPages.length} failed ${role} pages (attempt ${retryAttempt + 1})`
            );
            pagesToFetch = failedPages;
            retryAttempt++;
            await new Promise((r) => setTimeout(r, 500));
          } else {
            if (failedPages.length > 0) {
              console.warn(
                `[MapData] ${failedPages.length} ${role} pages failed after ${MAX_RETRIES} retries`
              );
            }
            break;
          }
        }
      } catch (err) {
        console.error(`[MapData] Error fetching ${role}:`, err);
      }
    };

    // Fetch farmers and providers in parallel
    await Promise.all([
      fetchRole(
        "farmer",
        (p, l) => api.getFarmers(p, l),
        (chunk) => setFarmerMarkers((prev) => [...prev, ...chunk]),
        (total) => setTotalFarmers(total)
      ),
      fetchRole(
        "service_provider",
        (p, l) => api.getServiceProviders(p, l),
        (chunk) => setProviderMarkers((prev) => [...prev, ...chunk]),
        (total) => setTotalProviders(total)
      ),
    ]);

    setIsFetching(false);
    console.log("[MapData] ─── Fetch complete ───");
  }, [isFetching]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboard();
      fetchProgressively();
    }
  }, [fetchDashboard, fetchProgressively]);

  // Combined markers
  const markers = useMemo<MapMarkerData[]>(
    () => [...farmerMarkers, ...providerMarkers],
    [farmerMarkers, providerMarkers]
  );

  const loading = dashboardLoading || isFetching;

  const refreshData = useCallback(async () => {
    hasFetched.current = false;
    abortRef.current = true;
    await fetchDashboard();
    await fetchProgressively();
  }, [fetchDashboard, fetchProgressively]);

  return {
    markers,
    statistics,
    loading,
    error: dashboardError,
    refreshData,
    totalFarmers,
    totalProviders,
  };
}
