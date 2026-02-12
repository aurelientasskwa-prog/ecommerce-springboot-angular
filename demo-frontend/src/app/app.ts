import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" [routerLink]="['/']">Mon E-commerce</a>
          <button class="navbar-toggler" type="button" (click)="isMenuCollapsed = !isMenuCollapsed">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" [class.show]="!isMenuCollapsed">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" [routerLink]="['/home']" routerLinkActive="active">Accueil</a>
              </li>
            </ul>
            <ul class="navbar-nav">
              <li class="nav-item" *ngIf="!isLoggedIn">
                <a class="nav-link" [routerLink]="['/login']" routerLinkActive="active">Connexion</a>
              </li>
              <li class="nav-item" *ngIf="isLoggedIn">
                <a class="nav-link" (click)="onLogout()" style="cursor: pointer;">Déconnexion</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main class="container py-4">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-light py-3 mt-5">
        <div class="container text-center">
          <span class="text-muted">© 2024 Mon E-commerce. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
    }
  `]
})
export class App implements OnInit {
  title = 'Mon Application';
  isMenuCollapsed = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }

  onLogout(): void {
    this.authService.logout();
    this.isMenuCollapsed = true; // Fermer le menu après la déconnexion
    this.router.navigate(['/login']);
  }
}