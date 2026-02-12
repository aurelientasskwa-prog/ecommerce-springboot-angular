import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Ne pas ajouter le token pour les requêtes d'authentification
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Récupérer le token depuis le localStorage
  const token = localStorage.getItem('auth-token');
  
  // Si pas de token, rediriger vers la page de connexion pour les routes protégées
  if (!token && !req.url.includes('/auth/')) {
    router.navigate(['/login']);
    return next(req);
  }

  // Cloner la requête et ajouter le token
  const authReq = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Si le token est invalide ou expiré, déconnecter l'utilisateur
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
