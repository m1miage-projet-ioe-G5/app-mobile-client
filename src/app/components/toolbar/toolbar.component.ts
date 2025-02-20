import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [
    IonicModule
  ]
})
export class ToolbarComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
