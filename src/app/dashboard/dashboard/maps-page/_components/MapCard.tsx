"use client";
import { Button } from "@/components/ui/button";
import MapView, { type MapViewHandle } from "@/components/maps/MapView";
import type { MapMarkerData } from "@/lib/geoUtils";
import { useState, useCallback, useRef, useMemo } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useMapData } from "../hooks/useMapData";
import {
  Maximize2,
  Minimize2,
  Sprout,
  Wrench,
  MapPin,
  X,
  Search,
  Wheat,
  LandPlot,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface MapCardProps {
  className?: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

export default function MapCard({
  className = "",
  isFullscreen = false,
  onFullscreenToggle,
}: MapCardProps) {
  const { selectedFilters } = useHeaderStore();
  const { markers: allMarkers, loading, error, refreshData, totalFarmers, totalProviders } = useMapData();
  const mapViewRef = useRef<MapViewHandle>(null);

  // Apply header-selected filters
  const markers = useMemo(() => {
    const serviceSel = selectedFilters["Services"] || "all";
    const cropSel = selectedFilters["Crops"] || "all";

    return allMarkers.filter((m) => {
      if (m.type === "service_provider") {
        if (serviceSel !== "all") {
          const services = m.services || [];
          const matches = services.some((s) =>
            s.toLowerCase().includes(serviceSel.toLowerCase())
          );
          if (!matches) return false;
        }
        return true;
      }
      if (m.type === "farmer") {
        if (cropSel !== "all") {
          const crops = m.crops || [];
          const matches = crops.some((c) =>
            c.toLowerCase().includes(cropSel.toLowerCase())
          );
          if (!matches) return false;
        }
        return true;
      }
      return true;
    });
  }, [allMarkers, selectedFilters]);

  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  const handleMarkerClick = useCallback((marker: MapMarkerData) => {
    setSelectedMarker(marker);
  }, []);

  const handleSearchSelect = useCallback((marker: MapMarkerData) => {
    setSelectedMarker(marker);
    mapViewRef.current?.flyTo(marker.position.lng, marker.position.lat, 14);
  }, []);

  const farmerCount = markers.filter((m) => m.type === "farmer").length;
  const providerCount = markers.filter((m) => m.type === "service_provider").length;

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#00594C]/10">
            <MapPin className="w-[18px] h-[18px] text-[#00594C]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">Ghana Map</h3>
            <div className="flex items-center gap-3 mt-0.5">
              {loading ? (
                <span className="text-xs text-gray-400">Loading...</span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #00594C, #00816E)" }} />
                    {farmerCount}{totalFarmers > farmerCount ? ` of ${totalFarmers}` : ""} Farmers
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)" }} />
                    {providerCount}{totalProviders > providerCount ? ` of ${totalProviders}` : ""} Providers
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer" onClick={() => refreshData()} title="Refresh data">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer" onClick={onFullscreenToggle}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* ── Map Container ───────────────────────────────────────────────── */}
      <div className={`relative transition-all duration-300 ease-in-out ${isFullscreen ? "h-[calc(100vh-200px)]" : "h-96 sm:h-[480px]"}`}>

        {/* Loading overlay */}
        {loading && markers.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#00594C] animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Loading map data...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && markers.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-gray-600">{error}</p>
              <Button variant="outline" size="sm" onClick={() => refreshData()} className="cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          </div>
        )}

        <MapView ref={mapViewRef} markers={markers} onMarkerClick={handleMarkerClick} highlightIds={highlightIds} />

        {/* ── Floating Search Bar ──────────────────────────────────────── */}
        <div className="absolute top-3 left-3 right-16 z-10">
          <MapSearchBar markers={markers} onSelect={handleSearchSelect} onHighlight={setHighlightIds} />
        </div>

        {/* ── Floating Legend ─────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-white/60 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #00594C, #00816E)" }} />
              <span className="font-medium text-gray-700">Farmers</span>
            </div>
            <div className="w-px h-3.5 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)" }} />
              <span className="font-medium text-gray-700">Providers</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Selected Marker Detail Panel ─────────────────────────────── */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100"
          >
            <SelectedMarkerPanel marker={selectedMarker} onClose={() => setSelectedMarker(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Map Search Bar ─────────────────────────────────────────────────────────

function MapSearchBar({
  markers,
  onSelect,
  onHighlight,
}: {
  markers: MapMarkerData[];
  onSelect: (marker: MapMarkerData) => void;
  onHighlight: (ids: Set<string>) => void;
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const q = query.toLowerCase().trim();
    const matched: MapMarkerData[] = [];

    for (const m of markers) {
      if (matched.length >= 8) break; // Cap results for performance
      if (
        m.name.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.phone.includes(q)
      ) {
        matched.push(m);
      }
    }

    return matched;
  }, [markers, query]);

  const showDropdown = isFocused && query.length >= 2;

  // Emit highlight IDs whenever results change
  const prevIdsRef = useRef<string>("");
  const resultIds = useMemo(() => results.map(r => r.id).join(","), [results]);
  if (resultIds !== prevIdsRef.current) {
    prevIdsRef.current = resultIds;
    onHighlight(new Set(results.map(r => r.id)));
  }

  return (
    <div className="relative max-w-sm">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search farmers, providers, regions..."
          className="w-full h-9 pl-9 pr-8 text-sm rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/60 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00594C]/20 focus:border-[#00594C]/30 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-11 left-0 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">
                No results found
              </div>
            ) : (
              results.map((m) => {
                const isFarmer = m.type === "farmer";
                return (
                  <button
                    key={m.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelect(m);
                      setQuery(m.name);
                      setIsFocused(false);
                    }}
                  >
                    {/* Type dot */}
                    <div
                      className="shrink-0 w-2 h-2 rounded-full"
                      style={{
                        background: isFarmer
                          ? "linear-gradient(135deg, #00594C, #00816E)"
                          : "linear-gradient(135deg, #2563EB, #60A5FA)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {isFarmer ? "Farmer" : "Provider"} · {m.region}
                        {m.district ? ` · ${m.district}` : ""}
                      </p>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Selected Marker Detail Panel ─────────────────────────────────────────

function SelectedMarkerPanel({ marker, onClose }: { marker: MapMarkerData; onClose: () => void }) {
  const isFarmer = marker.type === "farmer";

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background: isFarmer
                ? "linear-gradient(135deg, #00594C, #00816E)"
                : "linear-gradient(135deg, #2563EB, #60A5FA)",
            }}
          >
            {isFarmer ? <Sprout className="w-5 h-5 text-white" strokeWidth={2} /> : <Wrench className="w-5 h-5 text-white" strokeWidth={2} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{marker.name}</h4>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                style={{
                  background: isFarmer
                    ? "linear-gradient(135deg, #00594C, #00816E)"
                    : "linear-gradient(135deg, #2563EB, #60A5FA)",
                }}
              >
                {isFarmer ? "Farmer" : "Provider"}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {marker.district ? `${marker.district}, ` : ""}{marker.region}
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {isFarmer && marker.crops && marker.crops.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                  <Wheat className="w-3 h-3 text-[#00594C]" /> {marker.crops.join(", ")}
                </span>
              )}
              {isFarmer && marker.farmSize !== undefined && marker.farmSize > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                  <LandPlot className="w-3 h-3 text-[#00594C]" /> {marker.farmSize} acres
                </span>
              )}
              {!isFarmer && marker.services && marker.services.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                  <Wrench className="w-3 h-3 text-blue-600" /> {marker.services.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0 cursor-pointer" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
