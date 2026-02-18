import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationMessage {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationMessage>();
  notification$ = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'error') {
    this.notificationSubject.next({ message, type });
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }
}
