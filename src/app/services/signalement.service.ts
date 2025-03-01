import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalementService {
  private apiUrl = 'http://localhost:8081/api/v1/reports/';  // Your backend API endpoint

  constructor(private http: HttpClient) {}

  // Method to send the signalement (report) to the backend
  envoyerSignalement(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllSignalements(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);  // Adjust to match your backend API
  }
}
