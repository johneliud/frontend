import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
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
    this.http.get<any>('http://localhost:8083/api/users/profile').subscribe({
      next: (response) => {
        this.user = response.data;
        this.name = this.user!.name;
        this.email = this.user!.email;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.notificationService.show('Failed to load profile', 'error');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAvatarUrl(): string | null {
    if (!this.user?.avatar) return null;
    return `http://localhost:8083/api/users/avatars/${this.user.avatar}`;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.show('File size must be less than 2MB', 'error');
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.show('Only PNG, JPG, JPEG, WEBP allowed', 'error');
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
      this.notificationService.show('Name and email are required', 'error');
      return;
    }

    this.updating = true;
    this.http.put<any>('http://localhost:8083/api/users/profile', {
      name: this.name,
      email: this.email
    }).subscribe({
      next: (response) => {
        this.user = response.data;
        this.notificationService.show('Profile updated successfully', 'success');
        this.updating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.notificationService.show('Failed to update profile', 'error');
        this.updating = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadAvatar() {
    if (!this.selectedAvatar) {
      this.notificationService.show('Please select an image', 'error');
      return;
    }

    this.uploadingAvatar = true;
    const formData = new FormData();
    formData.append('avatar', this.selectedAvatar);

    this.http.put<any>('http://localhost:8083/api/users/profile/avatar', formData).subscribe({
      next: (response) => {
        this.user = response.data;
        this.selectedAvatar = null;
        this.avatarPreview = null;
        this.notificationService.show('Avatar updated successfully', 'success');
        this.uploadingAvatar = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to upload avatar:', err);
        this.notificationService.show('Failed to upload avatar', 'error');
        this.uploadingAvatar = false;
        this.cdr.detectChanges();
      }
    });
  }

  isSeller(): boolean {
    return this.user?.role === 'SELLER';
  }
}
