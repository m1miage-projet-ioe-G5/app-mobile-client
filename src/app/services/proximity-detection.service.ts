import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { LocationService } from './location.service';
import { SignalementService } from './signalement.service';

@Injectable({ providedIn: 'root' })
export class ProximityDetectionService {
  private readonly PROXIMITY_RADIUS = 50; // mètres
  private alreadyPromptedIds = new Set<number>();


  constructor(
    private locationService: LocationService,
    private signalementService: SignalementService,
    private alertCtrl: AlertController
  ) {}

  startMonitoring() {
    this.locationService.location$.subscribe((coords) => {
      if (!coords) return;

      this.signalementService.getAllSignalements().subscribe((signalements) => {
        signalements.forEach(signalement => {
          const distance = this.computeDistance(
            coords.latitude, coords.longitude,
            signalement.latitude, signalement.longitude
          );

          if (
            distance < this.PROXIMITY_RADIUS &&
            !this.alreadyPromptedIds.has(signalement.id)
          ) {
            this.alreadyPromptedIds.add(signalement.id);
            this.promptUserVerification(signalement);
          }
        });
      });
    });
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

  private async promptUserVerification(signalement: any) {
    const alert = await this.alertCtrl.create({
      header: '🚧 Travaux à proximité',
      message: `Un signalement est proche : "${signalement.description}". Est-il toujours présent ?`,
      buttons: [
        {
          text: 'Oui',
          handler: () => this.envoyerVerification(signalement.id, 'confirmed'),
        },
        {
          text: 'Non',
          handler: () => this.envoyerVerification(signalement.id, 'invalid'),
        },
        {
          text: 'Je ne sais pas',
          role: 'cancel',
          handler: () => this.envoyerVerification(signalement.id, 'unsure'),
        }
      ]
    });

    await alert.present();
  }

  private envoyerVerification(signalementId: number, status: 'confirmed' | 'invalid' | 'unsure') {
    // 🔁 Tu dois appeler un endpoint dans SignalementService ici
    console.log(`Vérification envoyée : ${status} pour signalement ${signalementId}`);
    // Exemple :
    // return this.signalementService.verifierSignalement(signalementId, status).subscribe();
  }
}
