import { Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin';
import { SignupComponent } from './components/signup/signup';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: '<h2>Dashboard</h2><p>Welcome to the dashboard!</p>'
})
export class DashboardComponent {}

export const routes: Routes = [
  { path: 'login', component: SigninComponent },
  { path: 'register', component: SignupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['seller'] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
