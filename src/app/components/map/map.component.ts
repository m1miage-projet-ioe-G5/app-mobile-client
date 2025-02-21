import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CommonModule } from "@angular/common";
import { getMarker } from 'src/app/components/map/utils/marker'; // Adjust the path based on your project structure
import { recenter } from 'src/app/components/map/utils/leaflet.utils';

@Component({
  selector: 'app-map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  public searchQuery: string = ''; // Stores user input for search
  public startLocation: string = ''; // Stores start address for route calculation
  public endLocation: string = ''; // Stores end address for route calculation
  public isLoading: boolean = false; // Tracks loading state for route calculation
  private apiKey = environment.openRouteServiceApiKey; // OpenRouteService API Key

  constructor(private platform: Platform, private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.platform.ready().then(() => {
      setTimeout(() => {
        this.initMap();
      }, 500); // Delay to ensure the DOM is fully loaded
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Clean up the map when the component is destroyed
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [43.604652, 1.444209], // Toulouse, France
      zoom: 12,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  // Converts an address to GPS coordinates using Nominatim.
  private getCoordinates(address: string): Promise<[number, number] | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    return this.http.get<any[]>(url).toPromise()
      .then(results => {
        if (!results || results.length === 0) {
          return null;
        }

        const firstResult = results[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);

        return [lat, lon] as [number, number];
      })
      .catch(() => null);
  }

  // Searches for a location using Nominatim and centers the map on it.
  searchLocation(): void {
    if (!this.searchQuery) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`;
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const { lat, lon } = results[0];
          const latLng = L.latLng(parseFloat(lat), parseFloat(lon));

          // Use getMarker function to create a custom marker
          const marker = getMarker(latLng);
          marker.addTo(this.map).bindPopup(`📍 ${this.searchQuery}`).openPopup();

          // Use recenter function to move the map
          recenter(this.map, latLng);
        } else {
          alert('No results found for your search query.');
        }
      },
      error: (err) => {
        console.error('Error fetching location:', err);
        alert('Failed to search for location. Please try again.');
      },
    });
  }
  /**
   * Draws the route on the map using the provided coordinates.
   * @param routeCoordinates - The route coordinates to be drawn on the map.
   */
  private drawRoute(routeCoordinates: [number, number][]): void {
    console.log("🚶‍♂️ Drawing route with coordinates:", routeCoordinates);

    // Create the polyline from the route coordinates
    const routeLine = L.polyline(routeCoordinates, { color: 'blue', weight: 4 }).addTo(this.map);

    // Zoom the map to fit the bounds of the route
    this.map.fitBounds(routeLine.getBounds());

    console.log("✅ Route drawn on the map!");
  }

  calculateRoute(startAddress: string, endAddress: string): void {
    if (!startAddress || !endAddress) return;

    this.isLoading = true; // Show loading indicator

    Promise.all([this.getCoordinates(startAddress), this.getCoordinates(endAddress)])
      .then(([startCoords, endCoords]) => {
        if (!startCoords || !endCoords) {
          alert('Unable to find coordinates for one or both addresses.');
          this.isLoading = false;
          return;
        }

        const apiKey = this.apiKey;
        const walkingUrl = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;

        console.log("🚶‍♂️ Walking route request URL:", walkingUrl);

        // Request walking directions from OpenRouteService
        this.http.get<any>(walkingUrl).subscribe({
          next: (data) => {
            console.log("Walking route response:", JSON.stringify(data, null, 2));

            if (!data.features || data.features.length === 0 || !data.features[0].geometry.coordinates) {
              alert('No walking route found.');
              this.isLoading = false;
              return;
            }

            // Extract route coordinates and draw the route on the map
            const routeCoordinates = data.features[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            this.drawRoute(routeCoordinates);
            this.isLoading = false;
          },
          error: (err) => {
            console.error("❌ Error fetching walking route:", err);
            alert('Error fetching walking route. Please try again.');
            this.isLoading = false;
          },
        });
      })
      .catch((err) => {
        console.error('Error getting coordinates:', err);
        alert('Error with geocoding. Please check your addresses.');
        this.isLoading = false;
      });
  }



}
