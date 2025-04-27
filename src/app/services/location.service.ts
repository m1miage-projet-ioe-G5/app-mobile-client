import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SimpleCoords {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private locationSubject = new BehaviorSubject<SimpleCoords | null>(null);
  public readonly location$: Observable<SimpleCoords | null> = this.locationSubject.asObservable();

  private watchId: number | null = null;

  constructor() {
    this.startTracking();
  }

  /** 🔁 Lance le suivi en continu */
  startTracking(): void {
    if (!navigator.geolocation) {
      console.error('Géolocalisation non supportée.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.locationSubject.next({ latitude, longitude });
      },
      (error) => {
        console.error('Erreur localisation :', error);
        this.locationSubject.next(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  /** ⛔ Stoppe le suivi */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /** 📦 Retourne la dernière position connue (si dispo) */
  getCurrentCoords(): SimpleCoords | null {
    return this.locationSubject.value;
  }
}
