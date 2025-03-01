import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SignalementService} from "../../services/signalement.service";

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
  standalone : true,
  imports: [IonicModule, CommonModule, FormsModule],

})
export class InfoPage implements OnInit {
  items: any[] = [];
  loading = true; // Track loading state

  constructor(private signalementService: SignalementService) {}

  ngOnInit() {
    this.getSignalements();
  }

  private getSignalements() {
    this.signalementService.getAllSignalements().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false; // Set loading to false once data is fetched
      },
      error: (err) => {
        console.error('Error fetching signalements:', err);
        this.loading = false; // Set loading to false even in case of error
      },
    });
  }

}
