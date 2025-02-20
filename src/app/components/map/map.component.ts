import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-component',  // ✅ Change from 'app-map' to 'app-map-component'
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;

  constructor(private platform: Platform) {}

  ngAfterViewInit(): void {
    this.platform.ready().then(() => {
      setTimeout(() => {
        this.initMap();
      }, 500);
    });
  }

  private initMap(): void {
    if (!document.getElementById('map')) return;

    this.map = L.map('map', {
      center: [43.604652, 1.444209],
      zoom: 12,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
