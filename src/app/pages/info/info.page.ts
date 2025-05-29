import { Component, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SignalementService } from "../../services/signalement.service";
import { LocationService } from "../../services/location.service";
import { filter, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class InfoPage implements OnInit {
  items: any[] = [];
  loading = true;

  constructor(
    private signalementService: SignalementService,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    try {
      const userCoords = await firstValueFrom(
        this.locationService.location$.pipe(filter(loc => loc !== null))
      );

      this.signalementService.getAllSignalements().subscribe({
        next: (data) => {
          this.items = data
            .map(signalement => ({
              ...signalement,
              distance: this.computeDistance(
                userCoords.latitude,
                userCoords.longitude,
                signalement.latitude,
                signalement.longitude
              )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);

          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur récupération signalements:', err);
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erreur localisation :', error);
      // fallback si position indispo
      this.signalementService.getAllSignalements().subscribe({
        next: (data) => {
          this.items = data.slice(0, 10);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur récupération signalements (fallback) :', err);
          this.loading = false;
        }
      });
    }
  }

  private computeDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
