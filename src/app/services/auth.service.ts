import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {BehaviorSubject, map, Observable, throwError} from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {



  private apiUrl = 'http://localhost:8081/api/v1/user/';

  constructor(private http: HttpClient) {}

  // 🔹 Fonction Login
  login(email: string, password: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${email}`).pipe(
      map((user) => {
        if (user && user.motDePasse === password) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          return user;
        } else {
          throw new Error('Mot de passe incorrect');
        }
      }),
      catchError((error) => {
        console.error('Erreur de connexion', error);
        return throwError(() => new Error('Utilisateur non trouvé ou problème de connexion'));
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}create`, userData);
  }

  // 🔹 Fonction Logout
  logout() {
    localStorage.removeItem('currentUser');
  }

  // 🔹 Récupérer l'utilisateur connecté
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  // 🔹 Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

}
