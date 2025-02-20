import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-signaler',
  templateUrl: './signaler.page.html',
  styleUrls: ['./signaler.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SignalerPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
