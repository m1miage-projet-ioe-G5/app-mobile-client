import { Component, OnInit } from '@angular/core';
import {ActionSheetController, IonicModule} from "@ionic/angular";
import { AuthService } from '../../services/auth.service';


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
  protected user: any;

  constructor(private authService: AuthService, private actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    console.log('Utilisateur connecté:', this.user);
  }
  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Options',
      buttons: [
        {
          text: 'Déconnexion',
          role: 'destructive',
          icon: 'log-out',
          handler: () => {
            this.logout();
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login'; // Redirige vers la page de connexion
  }


}
