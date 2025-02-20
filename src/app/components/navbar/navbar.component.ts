import {Component, OnInit, signal} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,

  imports: [
    IonicModule
  ]
})
export class NavbarComponent  {


  constructor(private router: Router) {}

  goHome(){
    this.router.navigate(['/map'])
  }
  onMonprofil() {
    this.router.navigate(['/profil']);
  }

  onInfo() {
    this.router.navigate(['/info']);
  }

  onSignal() {
    this.router.navigate(['/signaler']);
  }

  ngOnInit() {}

}
