import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalementService {
  private apiUrl = '/api/v1/reports';

  constructor(private http: HttpClient) {}

  envoyerSignalement(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
