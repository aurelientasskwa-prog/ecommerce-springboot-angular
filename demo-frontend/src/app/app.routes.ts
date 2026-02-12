import { Routes } from '@angular/router';
import LoginComponent from './components/login/login.component';
import HomeComponent from './home/home';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [() => !localStorage.getItem('auth-token') ? true : false]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
