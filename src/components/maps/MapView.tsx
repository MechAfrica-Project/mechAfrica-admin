"use client";

import { useMemo, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import {
    Map,
    MapControls,
    MapClusterLayer,
    MapPulseLayer,
    type MapRef,
} from "@/components/ui/map";
import type { MapMarkerData } from "@/lib/geoUtils";
import type * as MapLibreGL from "maplibre-gl";

// ─── Color Palette ──────────────────────────────────────────────────────────
const FARMER_COLOR = "#00594C";
const PROVIDER_COLOR = "#2563EB";

export interface MapViewHandle {
    flyTo: (lng: number, lat: number, zoom?: number) => void;
}

interface MapViewProps {
    markers: MapMarkerData[];
    onMarkerClick?: (marker: MapMarkerData) => void;
    /** IDs of markers to highlight with a pulsing ring */
    highlightIds?: Set<string>;
}

function markersToGeoJSON(
    markers: MapMarkerData[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
        type: "FeatureCollection",
        features: markers.map((m) => ({
            type: "Feature" as const,
            geometry: {
                type: "Point" as const,
                coordinates: [m.position.lng, m.position.lat],
            },
            properties: {
                id: m.id,
                type: m.type,
                name: m.name,
                region: m.region,
                district: m.district,
                phone: m.phone,
                crops: m.crops ? m.crops.join(", ") : "",
                farmSize: m.farmSize ?? 0,
                services: m.services ? m.services.join(", ") : "",
            },
        })),
    };
}

const MATCH_ALL: MapLibreGL.ExpressionSpecification = ["!", false] as unknown as MapLibreGL.ExpressionSpecification;

// Empty GeoJSON constant — avoids creating new object references
const EMPTY_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: [],
};

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
    { markers, onMarkerClick, highlightIds },
    ref
) {
    const mapRef = useRef<MapRef>(null);

    useImperativeHandle(ref, () => ({
        flyTo: (lng: number, lat: number, zoom = 13) => {
            mapRef.current?.map?.flyTo({
                center: [lng, lat],
                zoom,
                duration: 1500,
                essential: true,
            });
        },
    }));

    const farmerGeoJSON = useMemo(
        () => markersToGeoJSON(markers.filter((m) => m.type === "farmer")),
        [markers]
    );
    const providerGeoJSON = useMemo(
        () => markersToGeoJSON(markers.filter((m) => m.type === "service_provider")),
        [markers]
    );

    // Build highlight GeoJSON from matched IDs
    const highlightGeoJSON = useMemo(() => {
        if (!highlightIds || highlightIds.size === 0) return EMPTY_GEOJSON;

        const highlighted = markers.filter((m) => highlightIds.has(m.id));
        if (highlighted.length === 0) return EMPTY_GEOJSON;

        return markersToGeoJSON(highlighted);
    }, [markers, highlightIds]);

    const markerMap = useMemo(() => {
        const map = new window.Map<string, MapMarkerData>();
        for (const m of markers) {
            map.set(m.id, m);
        }
        return map;
    }, [markers]);

    const handlePointClick = useCallback(
        (feature: GeoJSON.Feature<GeoJSON.Point>) => {
            const id = feature.properties?.id;
            if (!id || !onMarkerClick) return;
            const marker = markerMap.get(id);
            if (marker) onMarkerClick(marker);
        },
        [markerMap, onMarkerClick]
    );

    return (
        <Map
            ref={mapRef}
            center={[-1.0232, 7.9465]}
            zoom={6}
            className="h-full w-full rounded-xl"
        >
            <MapControls
                position="bottom-right"
                showZoom
                showCompass
                showFullscreen
            />

            <MapClusterLayer
                data={farmerGeoJSON}
                clusterRadius={60}
                clusterMaxZoom={12}
                layers={[
                    {
                        prefix: "farmers",
                        color: FARMER_COLOR,
                        dotColor: FARMER_COLOR,
                        filter: MATCH_ALL,
                    },
                ]}
                onPointClick={handlePointClick}
            />

            <MapClusterLayer
                data={providerGeoJSON}
                clusterRadius={60}
                clusterMaxZoom={12}
                layers={[
                    {
                        prefix: "providers",
                        color: PROVIDER_COLOR,
                        dotColor: PROVIDER_COLOR,
                        filter: MATCH_ALL,
                    },
                ]}
                onPointClick={handlePointClick}
            />

            {/* Pulsing highlight for search results */}
            {highlightGeoJSON.features.length > 0 && (
                <MapPulseLayer data={highlightGeoJSON} color={FARMER_COLOR} />
            )}
        </Map>
    );
});

export default MapView;
