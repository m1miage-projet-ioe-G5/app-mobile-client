import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  prenom: string = '';
  nom: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  registerUser() {
    const userData = {
      prenom: this.prenom,
      nom: this.nom,
      email: this.email,
      motDePasse: this.password,  // Vérifie que le backend attend bien "motDePasse"
    };

    this.authService.register(userData).subscribe(
      (response) => {
        console.log('User registered:', response);
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Registration failed:', error);
        alert("Échec de l'inscription. Vérifiez vos informations.");
      }
    );
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }


  ngOnInit() {
  }

}
