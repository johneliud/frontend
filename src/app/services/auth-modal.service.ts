import { Injectable, signal } from '@angular/core';

export type AuthModalType = 'signin' | 'signup' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private activeModalSignal = signal<AuthModalType>(null);

  activeModal = this.activeModalSignal.asReadonly();

  openSignin() {
    this.activeModalSignal.set('signin');
  }

  openSignup() {
    this.activeModalSignal.set('signup');
  }

  close() {
    this.activeModalSignal.set(null);
  }
}
