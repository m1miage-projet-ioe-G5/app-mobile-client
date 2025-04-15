import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { IonicModule, Platform, LoadingController } from '@ionic/angular';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { getMarker } from 'src/app/pages/map/utils/marker';
import { recenter } from 'src/app/pages/map/utils/leaflet.utils';
import {debounceTime, distinctUntilChanged, finalize, Subject, switchMap, tap} from "rxjs";
import { AlertController } from '@ionic/angular';
import {LocationService} from "../../services/location.service";


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true, // ✅ Standalone page
  imports: [CommonModule, FormsModule, IonicModule] // ✅ Import MapComponent
})
export class MapPage implements AfterViewInit, OnDestroy {
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
  public isLoadingSuggestions: boolean = false;

  public routeSummary: { distance: string; duration: string; steps: string[] } | null = null;
  panelOpen = false;

  public searchSubject = new Subject<string>();
  public routeDetails: {
    distance: number;
    duration: number;
    steps: { type: string, instruction: string, completed?: boolean }[];
  } | null = null;

  constructor(
    private platform: Platform,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private locationService: LocationService,
    private alertController: AlertController
  ) {}

  ngAfterViewInit(): void {
    this.platform.ready().then(() => {
      this.locationService.startTracking();
      setTimeout(() => {
        this.initMap();


      }, 500);
    });
    setTimeout(() => {
      this.loadSignalements();
    }, 2000);
    this.loadRecentSearches();

    this.searchSubject.pipe(
      debounceTime(300), // 300 ms d'attente avant de lancer la requête
      distinctUntilChanged(), // Ne pas relancer si la valeur n'a pas changé
      tap(() => this.isLoadingSuggestions = true), // Afficher un spinner pendant la recherche
      switchMap(query => this.getLocationSuggestions(query)), // Appel à l'API
      finalize(() => this.isLoadingSuggestions = false) // Masquer le spinner après la requête
    ).subscribe(results => {
      this.searchResults = results;
    });


  }
  private getLocationSuggestions(query: string) {
    if (!query.trim()) return [];
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    return this.http.get<any[]>(url);
  }
  searchLocationSuggestions() {
    this.searchSubject.next(this.searchQuery);
  }


  selectSuggestion(suggestion: { display_name: string, lat: string, lon: string }) {
    this.searchQuery = suggestion.display_name;
    this.searchResults = [];

    const latLng = L.latLng(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    const marker = getMarker(latLng);
    marker.addTo(this.map).bindPopup(suggestion.display_name).openPopup();

    recenter(this.map, latLng);
    this.saveRecentSearch(suggestion.display_name);
  }

  private saveRecentSearch(location: string) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    if (!recentSearches.includes(location)) {
      recentSearches.unshift(location);
      if (recentSearches.length > 5) recentSearches.pop();
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }


  loadRecentSearches() {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]');
  }


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

  handleKeyDown(event: KeyboardEvent, index: number) {
    if (!this.searchResults.length) return; // Sécurité si pas de résultats

    let nextIndex = index;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (index + 1) % this.searchResults.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (index - 1 + this.searchResults.length) % this.searchResults.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.selectSuggestion(this.searchResults[index]);
      return;
    }

    // Récupérer l'élément et lui donner le focus
    const elements = document.querySelectorAll('.suggestions li');
    if (elements[nextIndex]) {
      (elements[nextIndex] as HTMLElement).focus();
    }
  }









  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.locationService.stopTracking();
    this.locationService.stopTracking();
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

        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${this.apiKey}&start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;

        this.http.get<any>(url).subscribe({
          next: (data) => {
            if (!data.features?.length) {
              alert('No walking route found.');
              return;
            }

            // Check if the route crosses any obstacles
            this.http.get<any[]>('http://localhost:8081/api/v1/reports/').subscribe(async signalements => {
              if (this.routeIntersectsObstacles(data.features[0].geometry.coordinates, signalements)) {
                const alert = await this.alertController.create({
                  header: 'Signalements sur route',
                  message: 'Signalements rencontrés sur cet itinéraire! Recherche itinéraire adapté en cours...',
                  buttons: ['OK']
                });

                await alert.present(); // Show the alert
                this.findAlternativeRoute(startCoords, endCoords, signalements);
              } else {
                this.drawWalkingRoute(data);
              }
            });
          },
          //error: () => alert('Error fetching route.'),
        });
      })
      .catch(() => alert('Error getting coordinates.'));
  }
  private routeIntersectsObstacles(routeCoords: [number, number][], signalements: any[]): boolean {
    const bufferDistance = 0.0005; // Approx ~50m buffer zone

    return signalements.some(signalement => {
      const signalLat = parseFloat(signalement.latitude);
      const signalLon = parseFloat(signalement.longitude);

      return routeCoords.some(([lon, lat]) =>
        Math.abs(lat - signalLat) < bufferDistance && Math.abs(lon - signalLon) < bufferDistance
      );
    });
  }
  private findAlternativeRoute(startCoords: [number, number], endCoords: [number, number], signalements: any[]): void {
    const midPoint = this.getSafeMidpoint(startCoords, endCoords, signalements);

    if (!midPoint) {
      alert("No alternative route found!");
      return;
    }

    // Get first leg of the journey (start → midPoint)
    const url1 = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${this.apiKey}&start=${startCoords[1]},${startCoords[0]}&end=${midPoint[1]},${midPoint[0]}`;

    // Get second leg of the journey (midPoint → end)
    const url2 = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${this.apiKey}&start=${midPoint[1]},${midPoint[0]}&end=${endCoords[1]},${endCoords[0]}`;

    Promise.all([
      this.http.get<any>(url1).toPromise(),
      this.http.get<any>(url2).toPromise(),
    ])
      .then(([route1, route2]) => {
        if (!route1.features?.length || !route2.features?.length) {
          alert('No valid alternative route found.');
          return;
        }

        // Merge both routes into one
        const combinedRoute = {
          features: [
            { geometry: { coordinates: [...route1.features[0].geometry.coordinates, ...route2.features[0].geometry.coordinates] } }
          ]
        };

        this.drawWalkingRoute(combinedRoute);
      })
      .catch(() => alert('Error fetching alternative route.'));
  }


  private getSafeMidpoint(startCoords: [number, number], endCoords: [number, number], signalements: any[]): [number, number] | null {
    let midLat = (startCoords[0] + endCoords[0]) / 2;
    let midLon = (startCoords[1] + endCoords[1]) / 2;

    const bufferDistance = 0.001; // Increase buffer (~100m instead of 50m)

    // Find a safe detour point
    for (let i = 0; i < 5; i++) {  // Try 5 alternative points
      const shift = (i + 1) * 0.0005; // Increase shift distance each time

      // Try shifting the detour point in different directions
      const possiblePoints: [number, number][] = [
        [midLat + shift, midLon], // North
        [midLat - shift, midLon], // South
        [midLat, midLon + shift], // East
        [midLat, midLon - shift], // West
      ];

      for (const [newLat, newLon] of possiblePoints) {
        const isSafe = !signalements.some(signalement => {
          const signalLat = parseFloat(signalement.latitude);
          const signalLon = parseFloat(signalement.longitude);
          return Math.abs(newLat - signalLat) < bufferDistance && Math.abs(newLon - signalLon) < bufferDistance;
        });

        if (isSafe) return [newLat, newLon]; // Return first safe detour
      }
    }

    return null; // No safe detour found
  }






  private loadSignalements(): void {
    const url = 'http://localhost:8081/api/v1/reports/'; // 🔹 Remplace par l'URL de ton API
    this.http.get<any[]>(url).subscribe({
      next: (signalements) => {
        signalements.forEach(signalement => {
          const { latitude, longitude, typeProbleme, description } = signalement;
          this.addSignalementMarker(latitude, longitude, typeProbleme, description);
        });
      },
      error: (err) => console.error('Erreur lors du chargement des signalements:', err)
    });
  }
  private addSignalementMarker(lat: number, lon: number, typeProbleme: string, description: string): void {
    if (!this.map) {
      console.error("Map is not initialized yet!");
      return;
    }

    // Ensure lat/lon are valid (avoid placing markers at [0,0] if invalid)
    if (lat === 0 && lon === 0) {
      console.warn("Skipping marker with invalid coordinates:", lat, lon);
      return;
    }

    const iconUrl = this.getIconUrlForProbleme(typeProbleme);
    const marker = L.marker([lat, lon], {
      icon: L.icon({
        iconUrl,
        iconSize: [40, 40], // Adjust size if needed
      })
    }).bindPopup(`<b>${typeProbleme}</b><br>${description}`);

    marker.addTo(this.map);
  }


  private getIconUrlForProbleme(typeProbleme: string): string {
    switch (typeProbleme) {
      case 'ENTRAVAUX': return '../../assets/icon/travaux.png';
      //case 'RAMPE': return 'assets/icons/rampe.png';
      case 'ACCENSSEURENPANNE': return '../../assets/icon/ascenseurpanne.png';
      default: return '../../assets/icon/Signalement_danger.png';
    }
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

    // Calculer la distance et la durée
    const distance = routeData.features[0].properties.segments[0].distance / 1000; // Convertir en kilomètres
    const duration = routeData.features[0].properties.segments[0].duration / 60; // Convertir en minutes
    const steps = routeData.features[0].properties.segments[0].steps.map((step: any) => ({
      type: step.type, // 'turn_left', 'turn_right', 'straight', etc.
      instruction: step.instruction,
    }));

    // Affectation à routeDetails
    this.routeDetails = {
      distance: distance,
      duration: duration,
      steps: steps,
    };

    // Ajuster la vue pour afficher l'itinéraire
    this.map.fitBounds(this.routeLine.getBounds());

    // Optionnel : Lecture vocale pour la première instruction
    this.speak("Itinéraire trouvé.");
  }
  convertDuration(duration: number): string {
    if (duration < 60) {
      return `${Math.round(duration)} min`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = Math.round(duration % 60);
      return `${hours} h ${minutes} min`;
    }
  }


  private trackUserLocation(): void {
    const customIcon = L.icon({
      iconUrl: 'assets/icon/custom-pin.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.locationService.location$.subscribe(coords => {
      if (!coords) return;

      const userLatLng = L.latLng(coords.latitude, coords.longitude);

      if (!this.userMarker) {
        this.userMarker = L.marker(userLatLng, { icon: customIcon }).addTo(this.map);
      } else {
        this.userMarker.setLatLng(userLatLng);
      }
    });
  }

  private speak(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  togglePanel() {
    this.panelOpen = !this.panelOpen;
  }
}
