import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8083/api/users';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Reactive authentication state
  private authStatus = signal<boolean>(this.isAuthenticated());
  public isAuthenticatedSignal = this.authStatus.asReadonly();

  // Reactive user role state
  private userRoleState = signal<string | null>(this.getUserRole());
  public userRoleSignal = this.userRoleState.asReadonly();

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    const formData = new FormData();
    const { avatar, ...userFields } = userData;
    formData.append('user', new Blob([JSON.stringify(userFields)], { type: 'application/json' }));
    if (avatar) {
      formData.append('avatar', avatar);
    }
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (this.isBrowser && response && response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.authStatus.set(true);
          this.userRoleState.set(this.getUserRole());
        }
      }),
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      this.authStatus.set(false);
      this.userRoleState.set(null);
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role ? payload.role.toLowerCase() : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
