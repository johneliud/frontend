import { Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin';
import { HomeComponent } from './components/home/home';
import { SignupComponent } from './components/signup/signup';
import { ProductsComponent } from './components/products/products';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard';
import { MediaManagementComponent } from './components/media-management/media-management';
import { ProfileComponent } from './components/profile/profile';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'products', component: ProductsComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'seller/dashboard',
    component: SellerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['seller'] },
  },
  {
    path: 'seller/media',
    component: MediaManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['seller'] },
  },

  { path: '**', redirectTo: '' },
];
