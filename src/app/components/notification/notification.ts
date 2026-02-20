import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(
      (notification) => {
        this.ngZone.run(() => {
          this.notification = notification;
          this.cdr.detectChanges();

          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
          }

          this.timeoutId = window.setTimeout(() => {
            this.ngZone.run(() => {
              this.notification = null;
              this.cdr.detectChanges();
            });
          }, 5000);
        });
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
    this.cdr.detectChanges();
  }
}
