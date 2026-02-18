import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  selectedRole: 'client' | 'seller' = 'client';
  avatarFile: File | null = null;
  errorMessage: string | null = null;
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['client', Validators.required],
      avatar: [null]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.signupForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
      if (role === 'client') {
        this.signupForm.get('avatar')?.clearValidators();
        this.signupForm.get('avatar')?.updateValueAndValidity();
        this.avatarFile = null;
      } else {
        this.signupForm.get('avatar')?.setValidators([Validators.required]);
        this.signupForm.get('avatar')?.updateValueAndValidity();
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onRoleChange(role: 'client' | 'seller') {
    this.signupForm.get('role')?.setValue(role);
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB
        this.signupForm.get('avatar')?.setErrors({ 'maxSize': true });
        this.avatarFile = null;
      } else if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        this.signupForm.get('avatar')?.setErrors({ 'fileType': true });
        this.avatarFile = null;
      }
      else {
        this.avatarFile = file;
        this.signupForm.patchValue({ avatar: this.avatarFile });
        this.signupForm.get('avatar')?.setErrors(null);
      }
    } else {
      this.avatarFile = null;
      this.signupForm.patchValue({ avatar: null });
    }
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.signupForm.valid) {
      const { confirmPassword, ...userData } = this.signupForm.value;
      this.authService.register(userData).subscribe({
        next: (response: any) => {
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.errorMessage = error.error.message || 'Registration failed';
          console.error('Registration failed', error);
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
