import { Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin';
import { HomeComponent } from './components/home/home';
import { SignupComponent } from './components/signup/signup';
import { ProductsComponent } from './components/products/products';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: SigninComponent },
  { path: 'register', component: SignupComponent },
  { path: 'products', component: ProductsComponent },
  {
    path: 'seller/dashboard',
    component: SellerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['seller'] },
  },

  // { path: 'products/:id', loadComponent: () => import('./components/product-detail/product-detail').then(m => m.ProductDetailComponent) },
  // { path: 'profile', loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  // { path: 'seller-dashboard', loadComponent: () => import('./components/seller-dashboard/seller-dashboard').then(m => m.SellerDashboardComponent), canActivate: [AuthGuard, RoleGuard], data: { roles: ['seller'] } },
  // { path: 'seller/products', loadComponent: () => import('./components/seller-products/seller-products').then(m => m.SellerProductsComponent), canActivate: [AuthGuard, RoleGuard], data: { roles: ['seller'] } },
  // { path: 'seller/media', loadComponent: () => import('./components/seller-media/seller-media').then(m => m.SellerMediaComponent), canActivate: [AuthGuard, RoleGuard], data: { roles: ['seller'] } },

  { path: '**', redirectTo: '' },
];
