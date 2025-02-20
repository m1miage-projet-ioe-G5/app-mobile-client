import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {LoginComponent} from "../../components/login/login.component";

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.page.html',
  styleUrls: ['./connexion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, LoginComponent],
})
export class ConnexionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
