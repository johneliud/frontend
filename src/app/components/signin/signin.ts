import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          const role = this.authService.getUserRole();
          if (role === 'seller') {
            this.router.navigate(['/seller-dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Login failed';
          console.error('Login failed', error);
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
