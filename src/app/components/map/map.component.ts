import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { IonicModule, Platform, LoadingController } from '@ionic/angular';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { getMarker } from 'src/app/components/map/utils/marker';
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
  public searchQuery: string = '';
  public startLocation: string = '';
  public endLocation: string = '';
  public isLoading: boolean = false;
  private apiKey = environment.openRouteServiceApiKey;
  private routeLine?: L.Polyline;
  private startMarker: L.Marker | null = null;
  private endMarker: L.Marker | null = null;
  private userMarker: L.Marker | null = null;
  public showSuggestions: boolean = false; // Controls visibility of suggestions
  public searchResults: any[] = []; // Stores search results
  public startSuggestions: any[] = [];
  public endSuggestions: any[] = [];
  public showStartSuggestions: boolean = false;
  public showEndSuggestions: boolean = false;


  searchStartSuggestions() {
    if (!this.startLocation) {
      this.startSuggestions = [];
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.startLocation)}`;
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        this.startSuggestions = results;
        this.showStartSuggestions = true;
      },
      error: (err) => {
        console.error('Erreur de récupération des suggestions:', err);
        this.startSuggestions = [];
      },
    });
  }

  searchEndSuggestions() {
    if (!this.endLocation) {
      this.endSuggestions = [];
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.endLocation)}`;
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        this.endSuggestions = results;
        this.showEndSuggestions = true;
      },
      error: (err) => {
        console.error('Erreur de récupération des suggestions:', err);
        this.endSuggestions = [];
      },
    });
  }

  selectStartSuggestion(result: any) {
    this.startLocation = result.display_name;
    this.showStartSuggestions = false;
  }

  selectEndSuggestion(result: any) {
    this.endLocation = result.display_name;
    this.showEndSuggestions = false;
  }

  hideStartSuggestions() {
    setTimeout(() => {
      this.showStartSuggestions = false;
    }, 200);
  }

  hideEndSuggestions() {
    setTimeout(() => {
      this.showEndSuggestions = false;
    }, 200);
  }




  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200); // Delay to allow click event before hiding
  }


  searchLocationSuggestions(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = []; // Clear suggestions when input is empty
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        this.searchResults = results.map(result => ({
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon
        }));
      },
      error: () => this.searchResults = [],
    });
  }

  selectSuggestion(suggestion: { display_name: string, lat: string, lon: string }) {
    this.searchQuery = suggestion.display_name; // Set the selected place
    this.searchResults = []; // Hide suggestions after selection

    const latLng = L.latLng(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    const marker = getMarker(latLng);
    marker.addTo(this.map).bindPopup(suggestion.display_name).openPopup();

    recenter(this.map, latLng);
  }


  constructor(
    private platform: Platform,
    private http: HttpClient,
    private loadingCtrl: LoadingController
  ) {}

  ngAfterViewInit(): void {
    this.platform.ready().then(() => {
      setTimeout(() => this.initMap(), 500);
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [43.604652, 1.444209],
      zoom: 12,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Optional: Enable live tracking
    this.trackUserLocation();
  }

  private async presentLoading(message: string): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
      duration: 2000,
    });
    await loading.present();
  }

  private async getCoordinates(address: string): Promise<[number, number] | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
      const results = await this.http.get<any[]>(url).toPromise();
      if (!results || results.length === 0) return null;
      return [parseFloat(results[0].lat), parseFloat(results[0].lon)];
    } catch {
      return null;
    }
  }

  searchLocation(): void {
    if (!this.searchQuery) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`;
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const { lat, lon } = results[0];
          const latLng = L.latLng(parseFloat(lat), parseFloat(lon));

          const marker = getMarker(latLng);
          marker.addTo(this.map).bindPopup(` ${this.searchQuery}`).openPopup();

          recenter(this.map, latLng);
        } else {
          alert('No results found.');
        }
      },
      error: () => alert('Failed to search for location.'),
    });
  }

  private clearPreviousRoute(): void {
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = undefined;
    }
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
      this.endMarker = null;
    }
  }

  calculateRoute(startAddress: string, endAddress: string): void {
    if (!startAddress || !endAddress) return;

    this.presentLoading("Calculating route...");
    this.clearPreviousRoute();

    Promise.all([this.getCoordinates(startAddress), this.getCoordinates(endAddress)])
      .then(([startCoords, endCoords]) => {
        if (!startCoords || !endCoords) {
          alert('Unable to find coordinates.');
          return;
        }

        const walkingUrl = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${this.apiKey}&start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;

        this.http.get<any>(walkingUrl).subscribe({
          next: (data) => {
            if (!data.features?.length) {
              alert('No walking route found.');
              return;
            }

            this.drawWalkingRoute(data);
          },
          error: () => alert('Error fetching route.'),
        });
      })
      .catch(() => alert('Error getting coordinates.'));
  }

  private drawWalkingRoute(routeData: any): void {
    const coordinates = routeData.features[0].geometry.coordinates;

    const latLngs: [number, number][] = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    this.clearPreviousRoute();

    this.routeLine = L.polyline(latLngs, { color: 'blue', weight: 4 }).addTo(this.map);
    const [startCoords, endCoords] = [latLngs[0], latLngs[latLngs.length - 1]];

    this.startMarker = L.marker(startCoords, {
      icon: L.icon({ iconUrl: 'assets/icon/start-marker.png', iconSize: [32, 32] }),
    }).bindPopup("Start Location").addTo(this.map);

    this.endMarker = L.marker(endCoords, {
      icon: L.icon({ iconUrl: 'assets/icon/end-marker.png', iconSize: [32, 32] }),
    }).bindPopup("End Location").addTo(this.map);

    this.map.fitBounds(this.routeLine.getBounds());

    // Optional: Speak the first instruction
    this.speak("Itinéraire trouvé.");
  }

  private trackUserLocation(): void {
    navigator.geolocation.watchPosition(
      (position) => {
        const userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
        if (!this.userMarker) {
          this.userMarker = L.marker(userLocation).addTo(this.map);
        } else {
          this.userMarker.setLatLng(userLocation);
        }
      },
      () => console.error("Error getting location"),
      { enableHighAccuracy: true }
    );
  }

  private speak(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}
