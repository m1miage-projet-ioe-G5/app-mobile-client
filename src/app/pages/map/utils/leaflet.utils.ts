import { Map as LeafletMap, LatLng } from "leaflet";

/**
 * Recenters the Leaflet map to a given position.
 *
 * @param leafletMap - The Leaflet map instance.
 * @param latlng - The coordinates (latitude, longitude) to recenter the map.
 * @param zoom - (Optional) The zoom level. Defaults to the current zoom or 15.
 */
export function recenter(leafletMap: LeafletMap, latlng: LatLng, zoom?: number): void {
  if (!leafletMap) {
    console.error("Leaflet map instance is undefined.");
    return;
  }

  // Ensure Leaflet correctly updates map dimensions (useful after resizing).
  leafletMap.invalidateSize({ animate: false });

  // Center map on given coordinates, using provided zoom or defaulting to current zoom.
  leafletMap.setView(latlng, zoom ?? leafletMap.getZoom() ?? 15);
}
