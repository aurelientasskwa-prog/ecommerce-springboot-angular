import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

// Constantes pour les clés de stockage local
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Vérifier périodiquement la validité du token
    this.setupTokenRefresh();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(credentials: { username: string, password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signin`, credentials)
      .pipe(
        map(response => this.processAuthResponse(response)),
        tap(user => this.handleAuthentication(user)),
        catchError(this.handleError)
      );
  }

  private processAuthResponse(response: any): User {
    // Normaliser la réponse du serveur
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      roles: response.roles || [],
      token: response.token || response.accessToken || response.jwt,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
      type: response.type || response.tokenType || 'Bearer',
      // Préserver les champs supplémentaires pour la compatibilité
      accessToken: response.accessToken,
      jwt: response.jwt,
      tokenType: response.tokenType
    };
    
    return user;
  }

  private handleAuthentication(user: User): void {
    this.storeUserData(user);
    this.currentUserSubject.next(user);
    this.scheduleTokenRefresh(user);
  }

  logout(redirect: boolean = true): void {
    // Supprimer les données d'authentification
    this.clearAuthData();
    
    // Rediriger vers la page de connexion si demandé
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  refreshToken(): Observable<User> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      return throwError(() => new Error('Aucun token de rafraîchissement disponible'));
    }

    return this.http.post<User>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        map(response => this.processAuthResponse(response)),
        tap(user => this.handleAuthentication(user)),
        catchError(error => {
          this.logout(false);
          return throwError(() => error);
        })
      );
  }

  private storeUserData(user: User): void {
    localStorage.setItem(TOKEN_KEY, user.token || '');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    if (user.refreshToken) {
      localStorage.setItem('refresh-token', user.refreshToken);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('refresh-token');
    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }


  private setupTokenRefresh(): void {
    // Vérifier périodiquement si le token est sur le point d'expirer
    const checkInterval = 300000; // 5 minutes
    
    setInterval(() => {
      const user = this.currentUserValue;
      if (user?.token && this.isTokenExpired(user.token)) {
        this.refreshToken().subscribe({
          next: () => console.log('Token rafraîchi avec succès'),
          error: (err) => {
            console.error('Échec du rafraîchissement du token:', err);
            this.logout(false);
          }
        });
      }
    }, checkInterval);
  }

  private scheduleTokenRefresh(user: User): void {
    if (!user.expiresIn) return;
    
    // Planifier le rafraîchissement 1 minute avant l'expiration
    const expiresInMs = user.expiresIn * 1000;
    const refreshTime = expiresInMs - 60000; // 1 minute avant expiration
    
    if (refreshTime > 0) {
      setTimeout(() => {
        this.refreshToken().subscribe();
      }, refreshTime);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || error.statusText;
    }
    
    console.error('Erreur d\'authentification:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user?.token || localStorage.getItem(TOKEN_KEY);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
