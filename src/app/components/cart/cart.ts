import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { NotificationService } from '../../services/notification';
import { Cart, CartItem } from '../../models/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error: string | null = null;
  updatingItemId: string | null = null;

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.error = null;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        this.error = 'Failed to load cart';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      this.removeItem(item);
      return;
    }
    this.updatingItemId = item.id;
    this.cartService.updateItem(item.id, newQty).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to update quantity';
        this.notificationService.error(msg);
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
    });
  }

  removeItem(item: CartItem) {
    this.updatingItemId = item.id;
    this.cartService.removeItem(item.id).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updatingItemId = null;
        this.notificationService.success('Item removed from cart');
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to remove item');
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
    });
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.notificationService.success('Cart cleared');
        this.cdr.detectChanges();
      },
      error: () => this.notificationService.error('Failed to clear cart'),
    });
  }

  getItemSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  get isEmpty(): boolean {
    return !this.cart?.items?.length;
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
