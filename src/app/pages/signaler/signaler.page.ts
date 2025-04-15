import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { SignalementService } from 'src/app/services/signalement.service'; // Vérifie bien le chemin
import { FormsModule } from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {LocationService} from "../../services/location.service";

@Component({
  selector: 'app-signaler',
  templateUrl: './signaler.page.html',
  styleUrls: ['./signaler.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class SignalerPage implements OnInit {
  signalementForm!: FormGroup;

  currentLatitude: number | null = null;
  currentLongitude: number | null = null;


  constructor(
    private fb: FormBuilder,
    private signalementService: SignalementService,
    private toastController: ToastController,
    private locationService: LocationService,
    private authService: AuthService  // Inject AuthService
  ) {}

  ngOnInit() {
    this.signalementForm = this.fb.group({
      typeProbleme: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.locationService.location$.subscribe((coords) => {
      if (coords) {
        this.currentLatitude = coords.latitude;
        this.currentLongitude = coords.longitude;
        //console vérif
        console.log(' Coordonnées actuelles :', coords.latitude, coords.longitude);
      }
    });
  }

  // Method to send the signalement (report) to the backend
  async envoyerSignalement() {
    if (this.signalementForm.invalid) {
      this.afficherToast('Veuillez remplir tous les champs !');
      return;
    }

    if (!this.currentLatitude || !this.currentLongitude) {
      this.afficherToast('Localisation non disponible.');
      return;
    }

    // Get the logged-in user's email from AuthService
    const currentUser = this.authService.getCurrentUser();
    const userEmail = currentUser ? currentUser.email : 'erreuruser@example.com';  // Fallback if no user is logged in

    const data = {
      id: 123, // à automatiser !!!!!!!!!!!!!!!!!
      longitude: this.currentLongitude,
      latitude: this.currentLatitude,
      typeProbleme: this.signalementForm.value.typeProbleme,
      description: this.signalementForm.value.description,
      photoUrl: "",  // Empty, can be added for future implementation (e.g., file upload)
      dateCreation: new Date().toISOString(),
      emailUser: userEmail // Use the logged-in user's email
    };

    // Call the service to send the data
    this.signalementService.envoyerSignalement(data).subscribe({
      next: async () => {
        this.afficherToast('Signalement envoyé avec succès !');
        this.signalementForm.reset();
      },
      error: async (err) => {
        console.error('Erreur:', err);
        this.afficherToast('Erreur lors de l\'envoi.');
      },
    });
  }

  // Method to show toast messages
  async afficherToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}
