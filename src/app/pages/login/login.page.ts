import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class LoginPage {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Méthode pour gérer la soumission du formulaire de connexion

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez entrer un email et un mot de passe.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe(
      (user) => {
        console.log('Connexion réussie', user);
        this.router.navigate(['/map']); // Redirection après connexion
      },
      (error) => {
        this.errorMessage = error.message;
      }
    );
  }


  // Navigate to the Register page
  goToRegister() {
    this.router.navigate(['/register']);
  }

  // Navigate to the Forgot Password page
  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

}
