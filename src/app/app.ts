import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { NotificationComponent } from './components/notification/notification';
import { SigninComponent } from './components/signin/signin';
import { SignupComponent } from './components/signup/signup';
import { AuthModalService } from './services/auth-modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    NotificationComponent,
    SigninComponent,
    SignupComponent,
    CommonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  constructor(public modalService: AuthModalService) {}
}
