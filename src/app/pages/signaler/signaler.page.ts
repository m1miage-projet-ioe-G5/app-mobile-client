import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { SignalementService } from 'src/app/services/signalement.service'; // Vérifie bien le chemin
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-signaler',
  templateUrl: './signaler.page.html',
  styleUrls: ['./signaler.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class SignalerPage implements OnInit {
  signalementForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private signalementService: SignalementService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.signalementForm = this.fb.group({
      typeProbleme: ['', Validators.required],
      lieu: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  async envoyerSignalement() {
    if (this.signalementForm.invalid) {
      this.afficherToast('Veuillez remplir tous les champs !');
      return;
    }

    const data = {
      longitude: 2.3522, // Remplace par la vraie longitude (via GPS)
      latitude: 48.8566, // Remplace par la vraie latitude
      typeProblem: this.signalementForm.value.typeProbleme,
      description: this.signalementForm.value.description,
      photo: "",
      dateCreation: new Date().toISOString(),
      emailUser: "user@example.com", // Remplace par l'email réel
      idLieu: this.signalementForm.value.lieu,
      idItineraire: null // Optionnel
    };

    this.signalementService.envoyerSignalement(data).subscribe({
      next: async () => {
        this.afficherToast('Signalement envoyé avec succès !');
        this.signalementForm.reset();
      },
      error: async (err) => {
        console.error('Erreur:', err);
        this.afficherToast('Erreur lors de l\'envoi.');
      }
    });
  }

  async afficherToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}

