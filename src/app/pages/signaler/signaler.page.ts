import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { SignalementService } from 'src/app/services/signalement.service'; // Vérifie bien le chemin
import { FormsModule } from "@angular/forms";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-signaler',
  templateUrl: './signaler.page.html',
  styleUrls: ['./signaler.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class SignalerPage implements OnInit {
  signalementForm!: FormGroup;

  // Hardcoded example coordinates for testing
  exampleLongitude: number = 1.3522;
  exampleLatitude: number = 43.8566;

  constructor(
    private fb: FormBuilder,
    private signalementService: SignalementService,
    private toastController: ToastController,
    private authService: AuthService  // Inject AuthService
  ) {}

  ngOnInit() {
    this.signalementForm = this.fb.group({
      typeProbleme: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  // Method to send the signalement (report) to the backend
  async envoyerSignalement() {
    if (this.signalementForm.invalid) {
      this.afficherToast('Veuillez remplir tous les champs !');
      return;
    }

    // Get the logged-in user's email from AuthService
    const currentUser = this.authService.getCurrentUser();
    const userEmail = currentUser ? currentUser.email : 'user@example.com';  // Fallback if no user is logged in

    const data = {
      id: 123,
      longitude: this.exampleLongitude,  // Hardcoded example longitude
      latitude: this.exampleLatitude,    // Hardcoded example latitude
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
