import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
  standalone : true,
  imports: [IonicModule, CommonModule, FormsModule],

})
export class InfoPage implements OnInit {
  items = [];

  ngOnInit() {
    this.generateItems();
  }

  private generateItems() {
    const count = this.items.length + 1;
    for (let i = 0; i < 25; i++) {
      // @ts-ignore
      this.items.push(`Problème ${count + i}`);
    }
  }

}
