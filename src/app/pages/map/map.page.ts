import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true, // ✅ Make it standalone
  imports: [CommonModule, FormsModule, IonicModule] // ✅ Import required modules
})
export class MapPage {}
