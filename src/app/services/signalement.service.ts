import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class SignalementService {
  private apiUrl = 'http://localhost:8081/api/v1/reports/';

  constructor(private http: HttpClient) {}

  envoyerSignalement(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
