import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  isSeller = computed(() => this.authService.userRoleSignal() === 'seller');
  isClient = computed(() => this.authService.userRoleSignal() === 'client');
  isMobileMenuOpen: boolean = false;
  cartCount = computed(() => this.cartService.cartCount());

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private modalService: AuthModalService,
    public cartService: CartService,
  ) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticatedSignal();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openLogin(): void {
    this.modalService.openSignin();
  }

  openSignup(): void {
    this.modalService.openSignup();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
