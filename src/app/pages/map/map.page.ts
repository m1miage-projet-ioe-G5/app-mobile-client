import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true, // ✅ Standalone page
  imports: [CommonModule, FormsModule, IonicModule, MapComponent] // ✅ Import MapComponent
})
export class MapPage {}
