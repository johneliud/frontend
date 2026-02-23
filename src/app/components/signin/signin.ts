import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { AuthModalService } from '../../services/auth-modal.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class SigninComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    public modalService: AuthModalService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  close() {
    this.modalService.close();
  }

  switchToSignup() {
    this.modalService.openSignup();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.notificationService.success('Login successful!');
          this.close();
            const role = this.authService.getUserRole();
            if (role === 'seller') {
              this.router.navigate(['/seller/dashboard']);
            } else {
              this.router.navigate(['/products']);
            }
        },
        error: (error: any) => {
          const message = error.error?.message || error.statusText || 'Login failed';
          this.errorMessage = message;
          this.notificationService.error(message);
          console.error('Login failed', error);
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
