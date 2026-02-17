import { Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin';
import { SignupComponent } from './components/signup/signup';

export const routes: Routes = [
  { path: 'login', component: SigninComponent },
  { path: 'register', component: SignupComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
