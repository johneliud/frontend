import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface ProductStat {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

interface BuyerStats {
  totalSpent: number;
  topProducts: ProductStat[];
}

interface SellerStats {
  totalRevenue: number;
  productStats: ProductStat[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  updating = false;
  uploadingAvatar = false;
  buyerStats: BuyerStats | null = null;
  sellerStats: SellerStats | null = null;

  name = '';
  email = '';
  selectedAvatar: File | null = null;
  avatarPreview: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/api/users/profile`).subscribe({
      next: (response) => {
        this.user = response.data;
        this.name = this.user!.name;
        this.email = this.user!.email;
        this.loading = false;
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.notificationService.error('Failed to load profile');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAvatarUrl(): string | null {
    if (!this.user?.avatar) return null;
    return `${environment.apiUrl}/api/users/avatars/${this.user.avatar}`;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.error('File size must be less than 2MB');
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Only PNG, JPG, JPEG, WEBP allowed');
        return;
      }

      this.selectedAvatar = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    if (!this.name || !this.email) {
      this.notificationService.error('Name and email are required');
      return;
    }

    this.updating = true;
    this.http.put<any>(`${environment.apiUrl}/api/users/profile`, {
      name: this.name,
      email: this.email
    }).subscribe({
      next: (response) => {
        this.user = response.data;
        this.notificationService.success('Profile updated successfully');
        this.updating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.notificationService.error('Failed to update profile');
        this.updating = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadAvatar() {
    if (!this.selectedAvatar) {
      this.notificationService.error('Please select an image');
      return;
    }

    this.uploadingAvatar = true;
    const formData = new FormData();
    formData.append('avatar', this.selectedAvatar);

    this.http.put<any>(`${environment.apiUrl}/api/users/profile/avatar`, formData).subscribe({
      next: (response) => {
        this.user = response.data;
        this.selectedAvatar = null;
        this.avatarPreview = null;
        this.notificationService.success('Avatar updated successfully');
        this.uploadingAvatar = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to upload avatar:', err);
        this.notificationService.error('Failed to upload avatar');
        this.uploadingAvatar = false;
        this.cdr.detectChanges();
      }
    });
  }

  isSeller(): boolean {
    return this.user?.role === 'SELLER';
  }

  loadStats() {
    if (!this.user) return;
    if (this.isSeller()) {
      this.http.get<any>(`${environment.apiUrl}/api/users/profile/seller-stats`).subscribe({
        next: (r) => { this.sellerStats = r.data; this.cdr.detectChanges(); },
        error: () => {}
      });
    } else {
      this.http.get<any>(`${environment.apiUrl}/api/users/profile/stats`).subscribe({
        next: (r) => { this.buyerStats = r.data; this.cdr.detectChanges(); },
        error: () => {}
      });
    }
  }
}
