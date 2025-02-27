import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class LoginComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
