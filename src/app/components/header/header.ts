import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  isSeller = computed(() => this.authService.userRoleSignal() === 'seller');
  isMobileMenuOpen: boolean = false;

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private modalService: AuthModalService,
  ) {}

  ngOnInit(): void {
    // Re-check auth status on navigation can still be useful if other things depend on it,
    // but authStatus and isSeller are now reactive via signals.
  }

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
