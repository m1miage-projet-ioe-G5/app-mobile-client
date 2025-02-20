import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router) {}

  isConnexionPage(): boolean {
    return this.router.url === '/connexion'; // ✅ Hide toolbar on connexion page
  }
}
