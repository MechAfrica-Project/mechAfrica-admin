"use client";

import * as React from "react";
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    useId,
    forwardRef,
    useImperativeHandle,
} from "react";
import * as MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import {
    Maximize,
    Minus,
    Plus,
    Compass,
    LocateFixed,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MapViewport {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
}

export interface MapRef {
    map: MapLibreGL.Map | null;
    isLoaded: boolean;
}

// ─── Context ────────────────────────────────────────────────────────────────

interface MapContextValue {
    map: MapLibreGL.Map | null;
    isLoaded: boolean;
}

const MapContext = createContext<MapContextValue>({
    map: null,
    isLoaded: false,
});

export function useMap() {
    const ctx = useContext(MapContext);
    if (!ctx) throw new Error("useMap must be used within a <Map> component.");
    return ctx;
}

// ─── Default Styles ─────────────────────────────────────────────────────────

const DEFAULT_LIGHT_STYLE =
    "https://tiles.openfreemap.org/styles/liberty";
const DEFAULT_DARK_STYLE =
    "https://tiles.openfreemap.org/styles/dark";

// ─── Map Component ──────────────────────────────────────────────────────────

interface MapProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
    children?: React.ReactNode;
    center?: [number, number];
    zoom?: number;
    bearing?: number;
    pitch?: number;
    theme?: "light" | "dark";
    styles?: {
        light?: string | MapLibreGL.StyleSpecification;
        dark?: string | MapLibreGL.StyleSpecification;
    };
    viewport?: Partial<MapViewport>;
    onViewportChange?: (viewport: MapViewport) => void;
    projection?: MapLibreGL.ProjectionSpecification;
}

const Map = forwardRef<MapRef, MapProps>(function Map(
    {
        children,
        className,
        center = [0, 20],
        zoom = 2,
        bearing = 0,
        pitch = 0,
        theme,
        styles,
        viewport,
        onViewportChange,
        projection,
        ...rest
    },
    ref
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreGL.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const resolvedTheme = theme ?? "light";

    const getStyle = useCallback(() => {
        if (resolvedTheme === "dark") {
            return styles?.dark ?? DEFAULT_DARK_STYLE;
        }
        return styles?.light ?? DEFAULT_LIGHT_STYLE;
    }, [resolvedTheme, styles]);

    // Init map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const effectiveCenter = viewport?.center ?? center;
        const effectiveZoom = viewport?.zoom ?? zoom;
        const effectiveBearing = viewport?.bearing ?? bearing;
        const effectivePitch = viewport?.pitch ?? pitch;

        const map = new MapLibreGL.Map({
            container: containerRef.current,
            style: getStyle(),
            center: effectiveCenter,
            zoom: effectiveZoom,
            bearing: effectiveBearing,
            pitch: effectivePitch,
            attributionControl: false,
        });

        if (projection) {
            map.setProjection(projection);
        }

        map.on("load", () => setIsLoaded(true));

        if (onViewportChange) {
            const emitViewport = () => {
                const c = map.getCenter();
                onViewportChange({
                    center: [c.lng, c.lat],
                    zoom: map.getZoom(),
                    bearing: map.getBearing(),
                    pitch: map.getPitch(),
                });
            };
            map.on("moveend", emitViewport);
            map.on("zoomend", emitViewport);
        }

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            setIsLoaded(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update style on theme change
    useEffect(() => {
        if (!mapRef.current) return;
        mapRef.current.setStyle(getStyle());
    }, [getStyle]);

    // Controlled viewport
    useEffect(() => {
        if (!mapRef.current || !viewport) return;
        const map = mapRef.current;
        if (viewport.center) map.setCenter(viewport.center);
        if (viewport.zoom !== undefined) map.setZoom(viewport.zoom);
        if (viewport.bearing !== undefined) map.setBearing(viewport.bearing);
        if (viewport.pitch !== undefined) map.setPitch(viewport.pitch);
    }, [viewport]);

    useImperativeHandle(ref, () => ({
        map: mapRef.current,
        isLoaded,
    }));

    return (
        <MapContext.Provider value={{ map: mapRef.current, isLoaded }}>
            <div
                ref={containerRef}
                className={cn("relative h-full w-full", className)}
                {...rest}
            />
            {isLoaded && children}
        </MapContext.Provider>
    );
});

Map.displayName = "Map";

// ─── MapControls ────────────────────────────────────────────────────────────

interface MapControlsProps {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    showZoom?: boolean;
    showCompass?: boolean;
    showLocate?: boolean;
    showFullscreen?: boolean;
    className?: string;
    onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

function MapControls({
    position = "bottom-right",
    showZoom = true,
    showCompass = false,
    showLocate = false,
    showFullscreen = false,
    className,
    onLocate,
}: MapControlsProps) {
    const { map } = useMap();

    const positionClasses: Record<string, string> = {
        "top-left": "top-3 left-3",
        "top-right": "top-3 right-3",
        "bottom-left": "bottom-3 left-3",
        "bottom-right": "bottom-3 right-3",
    };

    const handleZoomIn = () => map?.zoomIn();
    const handleZoomOut = () => map?.zoomOut();
    const handleResetBearing = () => map?.setBearing(0);
    const handleLocate = () => {
        navigator.geolocation?.getCurrentPosition((pos) => {
            const coords = {
                longitude: pos.coords.longitude,
                latitude: pos.coords.latitude,
            };
            map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
            onLocate?.(coords);
        });
    };
    const handleFullscreen = () => {
        const el = map?.getContainer();
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            el.requestFullscreen();
        }
    };

    const btnClass =
        "flex h-8 w-8 items-center justify-center rounded-md bg-background/90 backdrop-blur-sm shadow-sm border border-border/50 text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer";

    return (
        <div
            className={cn(
                "absolute z-10 flex flex-col gap-1.5",
                positionClasses[position],
                className
            )}
        >
            {showZoom && (
                <>
                    <button className={btnClass} onClick={handleZoomIn} title="Zoom in">
                        <Plus className="h-4 w-4" />
                    </button>
                    <button className={btnClass} onClick={handleZoomOut} title="Zoom out">
                        <Minus className="h-4 w-4" />
                    </button>
                </>
            )}
            {showCompass && (
                <button
                    className={btnClass}
                    onClick={handleResetBearing}
                    title="Reset bearing"
                >
                    <Compass className="h-4 w-4" />
                </button>
            )}
            {showLocate && (
                <button
                    className={btnClass}
                    onClick={handleLocate}
                    title="My location"
                >
                    <LocateFixed className="h-4 w-4" />
                </button>
            )}
            {showFullscreen && (
                <button
                    className={btnClass}
                    onClick={handleFullscreen}
                    title="Fullscreen"
                >
                    <Maximize className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

// ─── MapMarker ──────────────────────────────────────────────────────────────

interface MarkerContextValue {
    marker: MapLibreGL.Marker | null;
    longitude: number;
    latitude: number;
}

const MarkerContext = createContext<MarkerContextValue>({
    marker: null,
    longitude: 0,
    latitude: 0,
});

interface MapMarkerProps {
    longitude: number;
    latitude: number;
    children?: React.ReactNode;
    onClick?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    draggable?: boolean;
    onDragStart?: (lngLat: { lng: number; lat: number }) => void;
    onDrag?: (lngLat: { lng: number; lat: number }) => void;
    onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
}

function MapMarker({
    longitude,
    latitude,
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
    draggable = false,
    onDragStart,
    onDrag,
    onDragEnd,
}: MapMarkerProps) {
    const { map, isLoaded } = useMap();
    const markerRef = useRef<MapLibreGL.Marker | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!map || !isLoaded || !elementRef.current) return;

        const marker = new MapLibreGL.Marker({
            element: elementRef.current,
            draggable,
        })
            .setLngLat([longitude, latitude])
            .addTo(map);

        markerRef.current = marker;

        if (onClick) {
            elementRef.current.addEventListener("click", onClick);
        }
        if (onMouseEnter) {
            elementRef.current.addEventListener("mouseenter", onMouseEnter);
        }
        if (onMouseLeave) {
            elementRef.current.addEventListener("mouseleave", onMouseLeave);
        }
        if (onDragStart) {
            marker.on("dragstart", () => {
                const lngLat = marker.getLngLat();
                onDragStart({ lng: lngLat.lng, lat: lngLat.lat });
            });
        }
        if (onDrag) {
            marker.on("drag", () => {
                const lngLat = marker.getLngLat();
                onDrag({ lng: lngLat.lng, lat: lngLat.lat });
            });
        }
        if (onDragEnd) {
            marker.on("dragend", () => {
                const lngLat = marker.getLngLat();
                onDragEnd({ lng: lngLat.lng, lat: lngLat.lat });
            });
        }

        return () => {
            marker.remove();
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, isLoaded, longitude, latitude, draggable]);

    return (
        <MarkerContext.Provider
            value={{ marker: markerRef.current, longitude, latitude }}
        >
            <div ref={elementRef} className="cursor-pointer">
                {children ?? (
                    <div className="h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                )}
            </div>
        </MarkerContext.Provider>
    );
}

// ─── MarkerContent ──────────────────────────────────────────────────────────

interface MarkerContentProps {
    children?: React.ReactNode;
    className?: string;
}

function MarkerContent({ children, className }: MarkerContentProps) {
    return (
        <div className={cn("flex flex-col items-center", className)}>
            {children ?? (
                <div className="h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow-md" />
            )}
        </div>
    );
}

// ─── MarkerLabel ────────────────────────────────────────────────────────────

interface MarkerLabelProps {
    children?: React.ReactNode;
    className?: string;
    position?: "top" | "bottom";
}

function MarkerLabel({
    children,
    className,
    position = "top",
}: MarkerLabelProps) {
    return (
        <div
            className={cn(
                "whitespace-nowrap text-xs font-medium text-foreground bg-background/90 px-1.5 py-0.5 rounded shadow-sm",
                position === "top" ? "mb-1" : "mt-1",
                className
            )}
        >
            {children}
        </div>
    );
}

// ─── MarkerPopup ────────────────────────────────────────────────────────────

interface MarkerPopupProps {
    children?: React.ReactNode;
    className?: string;
    closeButton?: boolean;
    offset?: number;
}

function MarkerPopup({
    children,
    className,
    closeButton = false,
    offset = 10,
}: MarkerPopupProps) {
    const { marker } = useContext(MarkerContext);
    const popupRef = useRef<MapLibreGL.Popup | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!marker || !contentRef.current) return;

        const popup = new MapLibreGL.Popup({
            closeButton,
            offset,
            className: "mapcn-popup",
        }).setDOMContent(contentRef.current);

        marker.setPopup(popup);
        popupRef.current = popup;

        return () => {
            popup.remove();
            popupRef.current = null;
        };
    }, [marker, closeButton, offset]);

    return (
        <div style={{ display: "none" }}>
            <div
                ref={contentRef}
                className={cn(
                    "rounded-lg border bg-card p-3 text-card-foreground shadow-md",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}

// ─── MarkerTooltip ──────────────────────────────────────────────────────────

interface MarkerTooltipProps {
    children?: React.ReactNode;
    className?: string;
}

function MarkerTooltip({ children, className }: MarkerTooltipProps) {
    const { marker } = useContext(MarkerContext);
    const tooltipRef = useRef<MapLibreGL.Popup | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!marker || !contentRef.current) return;

        const el = marker.getElement();
        const popup = new MapLibreGL.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 10,
            className: "mapcn-popup",
        }).setDOMContent(contentRef.current);

        const show = () => popup.setLngLat(marker.getLngLat()).addTo(marker._map!);
        const hide = () => popup.remove();

        el.addEventListener("mouseenter", show);
        el.addEventListener("mouseleave", hide);
        tooltipRef.current = popup;

        return () => {
            el.removeEventListener("mouseenter", show);
            el.removeEventListener("mouseleave", hide);
            popup.remove();
        };
    }, [marker]);

    return (
        <div style={{ display: "none" }}>
            <div
                ref={contentRef}
                className={cn(
                    "rounded-md bg-popover px-2.5 py-1 text-xs text-popover-foreground shadow-md border",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}

// ─── MapPopup ───────────────────────────────────────────────────────────────

interface MapPopupProps {
    longitude: number;
    latitude: number;
    onClose?: () => void;
    children?: React.ReactNode;
    className?: string;
    closeButton?: boolean;
}

function MapPopup({
    longitude,
    latitude,
    onClose,
    children,
    className,
    closeButton = false,
}: MapPopupProps) {
    const { map, isLoaded } = useMap();
    const popupRef = useRef<MapLibreGL.Popup | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!map || !isLoaded || !contentRef.current) return;

        const popup = new MapLibreGL.Popup({
            closeButton,
            className: "mapcn-popup",
        })
            .setLngLat([longitude, latitude])
            .setDOMContent(contentRef.current)
            .addTo(map);

        if (onClose) {
            popup.on("close", onClose);
        }

        popupRef.current = popup;

        return () => {
            popup.remove();
            popupRef.current = null;
        };
    }, [map, isLoaded, longitude, latitude, closeButton, onClose]);

    return (
        <div style={{ display: "none" }}>
            <div
                ref={contentRef}
                className={cn(
                    "rounded-lg border bg-card p-3 text-card-foreground shadow-md",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}

// ─── MapRoute ───────────────────────────────────────────────────────────────

interface MapRouteProps {
    id?: string;
    coordinates: [number, number][];
    color?: string;
    width?: number;
    opacity?: number;
    dashArray?: [number, number];
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    interactive?: boolean;
}

function MapRoute({
    coordinates,
    color = "#4285F4",
    width = 3,
    opacity = 0.8,
    dashArray,
    onClick,
    onMouseEnter,
    onMouseLeave,
    interactive = true,
}: MapRouteProps) {
    const { map, isLoaded } = useMap();
    const uniqueId = useId();
    const sourceId = `route-source-${uniqueId}`;
    const layerId = `route-layer-${uniqueId}`;

    useEffect(() => {
        if (!map || !isLoaded) return;

        map.addSource(sourceId, {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates },
            },
        });

        map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
                "line-color": color,
                "line-width": width,
                "line-opacity": opacity,
                ...(dashArray ? { "line-dasharray": dashArray } : {}),
            },
        });

        if (interactive) {
            if (onClick) map.on("click", layerId, onClick);
            if (onMouseEnter) {
                map.on("mouseenter", layerId, () => {
                    map.getCanvas().style.cursor = "pointer";
                    onMouseEnter();
                });
            }
            if (onMouseLeave) {
                map.on("mouseleave", layerId, () => {
                    map.getCanvas().style.cursor = "";
                    onMouseLeave();
                });
            }
        }

        return () => {
            try {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, isLoaded]);

    return null;
}

// ─── MapClusterLayer ────────────────────────────────────────────────────────
// GPU-accelerated native clustering via MapLibre GL sources + layers.
// Handles 100K+ points without DOM overhead.

interface ClusterLayerConfig {
    /** Color for cluster circles */
    color: string;
    /** Color for individual (unclustered) point dots */
    dotColor: string;
    /** Filter expression to select features for this layer */
    filter: MapLibreGL.ExpressionSpecification;
    /** Unique prefix for source/layer IDs */
    prefix: string;
}

interface MapClusterLayerProps {
    /** GeoJSON FeatureCollection of Point features */
    data: GeoJSON.FeatureCollection<GeoJSON.Point>;
    /** Maximum zoom to cluster points at */
    clusterMaxZoom?: number;
    /** Radius of each cluster (in pixels) */
    clusterRadius?: number;
    /** Layer configurations — each creates a separate colored cluster group */
    layers: ClusterLayerConfig[];
    /** Called when a user clicks on an unclustered point feature */
    onPointClick?: (feature: GeoJSON.Feature<GeoJSON.Point>) => void;
}

function MapClusterLayer({
    data,
    clusterMaxZoom = 14,
    clusterRadius = 50,
    layers,
    onPointClick,
}: MapClusterLayerProps) {
    const { map, isLoaded } = useMap();
    const uniqueId = useId();
    const sourceId = `cluster-source-${uniqueId}`;
    const popupRef = useRef<MapLibreGL.Popup | null>(null);
    const isSetup = useRef(false);
    const layerIdsRef = useRef<string[]>([]);
    const onPointClickRef = useRef(onPointClick);
    onPointClickRef.current = onPointClick;

    // Effect 1: Initial setup — source, layers, event handlers (runs once)
    useEffect(() => {
        if (!map || !isLoaded || isSetup.current) return;

        // Add the GeoJSON source with clustering enabled
        map.addSource(sourceId, {
            type: "geojson",
            data,
            cluster: true,
            clusterMaxZoom,
            clusterRadius,
        });

        const layerIds: string[] = [];

        for (const layer of layers) {
            const clusterId = `${sourceId}-clusters-${layer.prefix}`;
            const countId = `${sourceId}-count-${layer.prefix}`;
            const unclusteredId = `${sourceId}-unclustered-${layer.prefix}`;

            // Cluster circles
            map.addLayer({
                id: clusterId,
                type: "circle",
                source: sourceId,
                filter: ["all", ["has", "point_count"], ...(layer.filter ? [layer.filter] : [])],
                paint: {
                    "circle-color": layer.color,
                    "circle-radius": [
                        "step",
                        ["get", "point_count"],
                        15,
                        50, 20,
                        200, 25,
                        500, 30,
                    ],
                    "circle-opacity": 0.85,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                },
            });

            // Cluster count labels
            map.addLayer({
                id: countId,
                type: "symbol",
                source: sourceId,
                filter: ["all", ["has", "point_count"], ...(layer.filter ? [layer.filter] : [])],
                layout: {
                    "text-field": "{point_count_abbreviated}",
                    "text-size": 12,
                    "text-font": ["Open Sans Bold"],
                },
                paint: {
                    "text-color": "#ffffff",
                },
            });

            // Unclustered individual dots
            map.addLayer({
                id: unclusteredId,
                type: "circle",
                source: sourceId,
                filter: ["all", ["!", ["has", "point_count"]], layer.filter],
                paint: {
                    "circle-color": layer.dotColor,
                    "circle-radius": 5,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                    "circle-opacity": 0.9,
                },
            });

            layerIds.push(clusterId, countId, unclusteredId);

            // Click on cluster → zoom in
            map.on("click", clusterId, (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: [clusterId],
                });
                if (!features.length) return;

                const clusteredFeatureId = features[0].properties?.cluster_id;
                const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
                source.getClusterExpansionZoom(clusteredFeatureId).then((zoom) => {
                    const geometry = features[0].geometry as GeoJSON.Point;
                    map.easeTo({
                        center: geometry.coordinates as [number, number],
                        zoom,
                    });
                });
            });

            // Click on unclustered point → callback
            map.on("click", unclusteredId, (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: [unclusteredId],
                });
                if (!features.length) return;
                onPointClickRef.current?.(features[0] as unknown as GeoJSON.Feature<GeoJSON.Point>);
            });

            // Tooltip on hover
            map.on("mouseenter", unclusteredId, (e) => {
                map.getCanvas().style.cursor = "pointer";

                popupRef.current?.remove();
                popupRef.current = null;

                const features = map.queryRenderedFeatures(e.point, {
                    layers: [unclusteredId],
                });
                if (!features.length) return;

                const props = features[0].properties;
                const geometry = features[0].geometry as GeoJSON.Point;
                const name = props?.name || "Unknown";
                const region = props?.region || "";

                popupRef.current = new MapLibreGL.Popup({
                    closeButton: false,
                    closeOnClick: true,
                    offset: 10,
                    className: "mapcn-popup",
                })
                    .setLngLat(geometry.coordinates as [number, number])
                    .setHTML(
                        `<div class="rounded-md bg-white px-2.5 py-1.5 text-xs shadow-md border">
              <div class="font-semibold text-gray-900">${name}</div>
              ${region ? `<div class="text-gray-500">${region}</div>` : ""}
            </div>`
                    )
                    .addTo(map);
            });

            map.on("mouseleave", unclusteredId, () => {
                map.getCanvas().style.cursor = "";
                popupRef.current?.remove();
                popupRef.current = null;
            });

            map.on("mouseenter", clusterId, () => {
                map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", clusterId, () => {
                map.getCanvas().style.cursor = "";
            });
        }

        layerIdsRef.current = layerIds;
        isSetup.current = true;

        return () => {
            popupRef.current?.remove();
            isSetup.current = false;
            try {
                for (const id of layerIdsRef.current) {
                    if (map.getLayer(id)) map.removeLayer(id);
                }
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // Map may already be destroyed
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect 2: Update source data in-place — runs on every data change (lightweight)
    useEffect(() => {
        if (!map || !isSetup.current) return;

        try {
            const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
            if (source) {
                source.setData(data);
            }
        } catch {
            // Source may not exist yet
        }
    }, [map, sourceId, data]);

    return null;
}

// ─── MapPulseLayer ──────────────────────────────────────────────────────────
// Renders animated pulsing rings around highlighted points on the map.
// GPU-accelerated — uses requestAnimationFrame to animate circle properties.

interface MapPulseLayerProps {
    /** GeoJSON FeatureCollection of Point features to highlight */
    data: GeoJSON.FeatureCollection<GeoJSON.Point>;
    /** Color of the pulse ring */
    color?: string;
}

function MapPulseLayer({ data, color = "#00594C" }: MapPulseLayerProps) {
    const { map, isLoaded } = useMap();
    const uniqueId = useId();
    const sourceId = `pulse-source-${uniqueId}`;
    const pulseLayerId = `pulse-ring-${uniqueId}`;
    const dotLayerId = `pulse-dot-${uniqueId}`;
    const animRef = useRef<number>(0);
    const isSetupRef = useRef(false);

    // Setup source + layers once
    useEffect(() => {
        if (!map || !isLoaded || isSetupRef.current) return;

        map.addSource(sourceId, {
            type: "geojson",
            data,
        });

        // Outer pulsing ring
        map.addLayer({
            id: pulseLayerId,
            type: "circle",
            source: sourceId,
            paint: {
                "circle-radius": 12,
                "circle-color": "transparent",
                "circle-stroke-width": 2.5,
                "circle-stroke-color": color,
                "circle-stroke-opacity": 0.8,
            },
        });

        // Inner solid dot
        map.addLayer({
            id: dotLayerId,
            type: "circle",
            source: sourceId,
            paint: {
                "circle-radius": 7,
                "circle-color": color,
                "circle-opacity": 0.9,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
            },
        });

        isSetupRef.current = true;

        // Animate the pulse
        let startTime = performance.now();
        const animate = (time: number) => {
            if (!map || !isSetupRef.current) return;

            const elapsed = time - startTime;
            const t = (elapsed % 1500) / 1500; // 1.5s cycle

            // Ease out: ring expands then fades
            const radius = 10 + t * 18; // 10 → 28
            const opacity = 0.8 * (1 - t); // 0.8 → 0

            try {
                if (map.getLayer(pulseLayerId)) {
                    map.setPaintProperty(pulseLayerId, "circle-radius", radius);
                    map.setPaintProperty(pulseLayerId, "circle-stroke-opacity", opacity);
                }
            } catch {
                // Layer may have been removed
                return;
            }

            animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animRef.current);
            isSetupRef.current = false;
            try {
                if (map.getLayer(pulseLayerId)) map.removeLayer(pulseLayerId);
                if (map.getLayer(dotLayerId)) map.removeLayer(dotLayerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // Map may already be destroyed
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, isLoaded]);

    // Update data in-place
    useEffect(() => {
        if (!map || !isSetupRef.current) return;
        try {
            const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
            if (source) source.setData(data);
        } catch {
            // Source may not exist yet
        }
    }, [map, sourceId, data]);

    return null;
}

// ─── Exports ────────────────────────────────────────────────────────────────

export {
    Map,
    MapControls,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
    MarkerLabel,
    MapPopup,
    MapRoute,
    MapClusterLayer,
    MapPulseLayer,
};

