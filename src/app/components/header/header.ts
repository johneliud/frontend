import { Component, OnInit } from '@angular/core';
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
  isSeller: boolean = false;
  isMobileMenuOpen: boolean = false;

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private modalService: AuthModalService,
  ) {}

  ngOnInit(): void {
    this.checkUserRole();

    // Re-check auth status on navigation
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.checkUserRole();
    });
  }

  checkUserRole(): void {
    const userRole = this.authService.getUserRole();
    this.isSeller = userRole === 'seller';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
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
    this.isSeller = false;
    this.router.navigate(['/']);
  }
}
