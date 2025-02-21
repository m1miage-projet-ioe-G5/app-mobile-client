import { Icon, LatLngExpression, Marker, icon, marker } from "leaflet";

/**
 * Creates and returns a Leaflet marker from geographic coordinates.
 * @param latlng The geographic coordinates of the marker.
 * @returns A Leaflet marker corresponding to the geographic coordinates.
 */
export function getMarker(latlng: LatLngExpression): Marker {
  return marker(latlng, {
    icon: icon({
      iconUrl: 'assets/icon/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],   // Default Leaflet marker size
      iconAnchor: [12, 41], // Anchor point of the icon
      popupAnchor: [1, -34], // Popup location relative to icon
      shadowSize: [41, 41]  // Default Leaflet shadow size
    })
  });
}
