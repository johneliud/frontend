import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Cart } from '../models/cart';
import { Order } from '../models/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/api/cart`;

  private cartItemCount = signal<number>(0);
  cartCount = this.cartItemCount.asReadonly();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(r => r.data || r),
      tap(cart => this.cartItemCount.set(cart?.items?.length ?? 0))
    );
  }

  addItem(item: { productId: string; productName: string; price: number; quantity: number; sellerId: string; imageUrl?: string }): Observable<Cart> {
    return this.http.post<any>(`${this.apiUrl}/items`, item).pipe(
      map(r => r.data || r),
      tap(cart => this.cartItemCount.set(cart?.items?.length ?? 0))
    );
  }

  updateItem(itemId: string, quantity: number): Observable<Cart> {
    return this.http.put<any>(`${this.apiUrl}/items/${itemId}`, { quantity }).pipe(
      map(r => r.data || r),
      tap(cart => this.cartItemCount.set(cart?.items?.length ?? 0))
    );
  }

  removeItem(itemId: string): Observable<Cart> {
    return this.http.delete<any>(`${this.apiUrl}/items/${itemId}`).pipe(
      map(r => r.data || r),
      tap(cart => this.cartItemCount.set(cart?.items?.length ?? 0))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<any>(this.apiUrl).pipe(
      map(() => undefined),
      tap(() => this.cartItemCount.set(0))
    );
  }

  checkout(checkoutData: { deliveryAddress: { fullName: string; address: string; city: string; phone: string }; paymentMethod: string }): Observable<Order> {
    return this.http.post<any>(`${this.apiUrl}/checkout`, checkoutData).pipe(
      map(r => r.data || r),
      tap(() => this.cartItemCount.set(0))
    );
  }
}
