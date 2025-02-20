import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {UserCreationRequest, UserResponse} from "../modeles/user";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createUser(user: UserCreationRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/api/v1/user/create`, user);
  }

}
