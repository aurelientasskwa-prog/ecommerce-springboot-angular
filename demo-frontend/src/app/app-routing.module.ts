import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.default)
  },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home').then(m => m.default),
    canActivate: [authGuard]
  },
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  { 
    path: '**', 
    redirectTo: '/home',
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
