import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

const AUTH_API = 'http://localhost:8080/api/auth/';

export const TOKEN_KEY = 'auth-token';
export const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {
    // Vérifier l'état de connexion au démarrage
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (e) {
        this.clearAuthData();
      }
    }
  }

  get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}signin`, credentials).pipe(
      tap({
        next: (response) => {
          this.setAuthData(response);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Erreur de connexion:', error);
          throw error;
        }
      })
    );
  }

  logout(redirect: boolean = true): void {
    this.clearAuthData();
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, authData.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authData));
    this.currentUserSubject.next(authData);
  }

  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }
}