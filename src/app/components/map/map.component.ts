import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  public searchQuery: string = ''; // Stores user input for search
  public startLocation: string = ''; // Stores start address for route calculation
  public endLocation: string = ''; // Stores end address for route calculation
  public isLoading: boolean = false; // Tracks loading state for route calculation

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

  /**
   * Initializes the Leaflet map.
   */
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

  /**
   * Searches for a location using Nominatim and centers the map on it.
   */
  searchLocation(): void {
    if (!this.searchQuery) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      this.searchQuery
    )}`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const { lat, lon } = results[0];
          this.map.setView([parseFloat(lat), parseFloat(lon)], 14); // Center the map

          // Add a marker for the location
          L.marker([parseFloat(lat), parseFloat(lon)])
            .addTo(this.map)
            .bindPopup(`📍 ${this.searchQuery}`)
            .openPopup();
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
   * Calculates and displays a route between two addresses.
   * @param startAddress - The starting address.
   * @param endAddress - The destination address.
   */
  calculateRoute(startAddress: string, endAddress: string): void {
    if (!startAddress || !endAddress) return;

    this.isLoading = true; // Show loading indicator

    // Convert addresses to coordinates
    Promise.all([this.getCoordinates(startAddress), this.getCoordinates(endAddress)])
      .then(([startCoords, endCoords]) => {
        if (!startCoords || !endCoords) {
          alert('Could not find coordinates for one or both addresses.');
          this.isLoading = false;
          return;
        }

        const apiKey = environment.openRouteServiceApiKey;
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;

        // Fetch route data from OpenRouteService
        this.http.get<any>(url).subscribe({
          next: (data) => {
            const route = data.routes[0].geometry.coordinates;
            const latLngs = route.map((coord: [number, number]) => [coord[1], coord[0]]); // Convert to Leaflet format

            // Draw the route on the map
            const routeLine = L.polyline(latLngs, { color: 'blue', weight: 4 }).addTo(this.map);
            this.map.fitBounds(routeLine.getBounds()); // Zoom to fit the route
            this.isLoading = false; // Hide loading indicator
          },
          error: (err) => {
            console.error('Error fetching route:', err);
            alert('Failed to calculate route. Please check your input and try again.');
            this.isLoading = false; // Hide loading indicator
          },
        });
      })
      .catch((err) => {
        console.error('Error fetching coordinates:', err);
        alert('Failed to geocode addresses. Please check your input and try again.');
        this.isLoading = false; // Hide loading indicator
      });
  }

  /**
   * Converts an address to GPS coordinates using Nominatim.
   * @param address - The address to geocode.
   * @returns A promise resolving to [lat, lon] or null if no results are found.
   */
  private getCoordinates(address: string): Promise<[number, number] | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    return this.http
      .get<any[]>(url)
      .toPromise()
      .then((results) => {
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          return [lat, lon] as [number, number]; // Explicitly cast to tuple
        }
        return null; // No results found
      })
      .catch((err) => {
        console.error('Error fetching coordinates:', err);
        return null;
      });
  }
}
