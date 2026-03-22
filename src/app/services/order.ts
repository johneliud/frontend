import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderStatus } from '../models/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  getOrders(search?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(r => r.data?.content || r.data || [])
    );
  }

  getSellerOrders(search?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.apiUrl}/seller`, { params }).pipe(
      map(r => r.data?.content || r.data || [])
    );
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status }).pipe(map(r => r.data));
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {}).pipe(map(r => r.data));
  }
}
