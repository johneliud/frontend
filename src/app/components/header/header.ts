import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  isSeller: boolean = false;
  isMobileMenuOpen: boolean = false;

  constructor(private authService: AuthService, public themeService: ThemeService) {}

  ngOnInit(): void {
    this.checkUserRole();
  }

  checkUserRole(): void {
    const userRole = this.authService.getUserRole();
    this.isSeller = userRole === 'seller';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
