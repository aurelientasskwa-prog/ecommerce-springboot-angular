import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // RouterLink removed as it's not used in the template
  ],
  template: `
    <div class="login-container">
      <div class="card">
        <div class="card-header">
          <h2>Connexion</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div *ngIf="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
            
            <div class="mb-3">
              <label for="username" class="form-label">Nom d'utilisateur</label>
              <input 
                type="text" 
                id="username" 
                class="form-control" 
                formControlName="username"
                [class.is-invalid]="f['username'].invalid && f['username'].touched"
              >
              <div *ngIf="f['username'].invalid && f['username'].touched" class="invalid-feedback">
                <div *ngIf="f['username'].errors?.['required']">Le nom d'utilisateur est requis</div>
                <div *ngIf="f['username'].errors?.['minlength']">
                  Le nom d'utilisateur doit faire au moins 3 caractères
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label for="password" class="form-label">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                class="form-control" 
                formControlName="password"
                [class.is-invalid]="f['password'].invalid && f['password'].touched"
              >
              <div *ngIf="f['password'].invalid && f['password'].touched" class="invalid-feedback">
                <div *ngIf="f['password'].errors?.['required']">Le mot de passe est requis</div>
                <div *ngIf="f['password'].errors?.['minlength']">
                  Le mot de passe doit faire au moins 6 caractères
                </div>
              </div>
            </div>

            <div class="d-grid">
              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="loginForm.invalid || isLoading"
              >
                <span *ngIf="!isLoading">Se connecter</span>
                <span *ngIf="isLoading">Connexion en cours...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      background-color: #f8f9fa;
    }
    
    .login-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 2rem 1rem;
      height: 100%;
      display: flex;
      align-items: center;
    }
    
    .card {
      width: 100%;
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      background-color: #f8f9fa;
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
      text-align: center;
    }
    
    .card-header h2 {
      margin: 0;
      color: #333;
      font-weight: 600;
    }
    
    .card-body {
      padding: 2rem;
    }
    
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #495057;
      display: block;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      border: 1px solid #ced4da;
      font-size: 1rem;
      line-height: 1.5;
    }
    
    .form-control:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      outline: 0;
    }
    
    .form-control.is-invalid {
      border-color: #dc3545;
      padding-right: calc(1.5em + 0.75rem);
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
    
    .btn {
      display: inline-block;
      font-weight: 400;
      line-height: 1.5;
      color: #fff;
      text-align: center;
      text-decoration: none;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      background-color: #0d6efd;
      border: 1px solid #0d6efd;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border-radius: 0.375rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, 
                  border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    
    .btn:hover {
      background-color: #0b5ed7;
      border-color: #0a58ca;
    }
    
    .btn:disabled {
      background-color: #86b7fe;
      border-color: #86b7fe;
      cursor: not-allowed;
      opacity: 0.65;
    }
    
    .alert {
      position: relative;
      padding: 0.75rem 1.25rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
    }
    
    .alert-danger {
      color: #842029;
      background-color: #f8d7da;
      border-color: #f5c2c7;
    }
    
    .invalid-feedback {
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875em;
      color: #dc3545;
    }
    
    .d-grid {
      display: grid;
    }
    
    .mb-3 {
      margin-bottom: 1rem !important;
    }
    
    .mb-4 {
      margin-bottom: 1.5rem !important;
    }
  `]
})
export default class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        // La navigation est gérée dans le service après une connexion réussie
      },
      error: (error) => {
        console.error('Erreur de connexion', error);
        this.errorMessage = 'Identifiants incorrects ou problème de connexion';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Méthodes utilitaires pour accéder facilement aux contrôles du formulaire
  get f() { return this.loginForm.controls; }
}
