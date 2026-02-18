import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMessage } from '../../services/notification';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: NotificationMessage | null = null;
  private subscription?: Subscription;
  private timeoutId?: number;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(
      (notification) => {
        this.notification = notification;
        
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        
        this.timeoutId = window.setTimeout(() => {
          this.notification = null;
        }, 5000);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  close() {
    this.notification = null;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
