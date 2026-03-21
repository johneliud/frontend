import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { NotificationService } from '../../services/notification';
import { Cart } from '../../models/cart';
import { Order } from '../../models/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  loadingCart = true;
  placing = false;
  confirmed = false;
  placedOrder: Order | null = null;

  addressForm: FormGroup;
  selectedPaymentMethod = 'PAY_ON_DELIVERY';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.addressForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
    });
  }

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loadingCart = false;
        if (!cart?.items?.length) {
          this.router.navigate(['/cart']);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCart = false;
        this.router.navigate(['/cart']);
      },
    });
  }

  get total(): number {
    return this.cart?.totalAmount ?? 0;
  }

  placeOrder() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.placing = true;
    const checkoutData = {
      deliveryAddress: {
        fullName: this.addressForm.value.name,
        address: this.addressForm.value.address,
        city: this.addressForm.value.city,
        phone: this.addressForm.value.phone,
      },
      paymentMethod: this.selectedPaymentMethod
    };
    this.cartService.checkout(checkoutData).subscribe({
      next: (order) => {
        this.placedOrder = order;
        this.confirmed = true;
        this.placing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to place order. Please try again.';
        this.notificationService.error(msg);
        this.placing = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.addressForm.get(field);
    return !!(ctrl && ctrl.touched && ctrl.hasError(error));
  }
}
