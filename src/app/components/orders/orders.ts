import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { OrderService } from '../../services/order';
import { CartService } from '../../services/cart';
import { NotificationService } from '../../services/notification';
import { Order, OrderStatus } from '../../models/order';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  search = '';
  expandedOrderId: string | null = null;
  showCancelConfirm = false;
  orderToCancel: Order | null = null;
  updatingOrderId: string | null = null;

  readonly sellerStatuses: OrderStatus[] = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  get isSeller(): boolean {
    return this.authService.userRoleSignal() === 'seller';
  }

  loadOrders() {
    this.loading = true;
    this.error = null;

    const request = this.isSeller
      ? this.orderService.getSellerOrders(this.search || undefined)
      : this.orderService.getOrders(this.search || undefined);

    request.subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.error = 'Failed to load orders';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch() {
    this.loadOrders();
  }

  toggleExpand(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrderId === orderId;
  }

  // Buyer: cancel
  confirmCancel(order: Order) {
    this.orderToCancel = order;
    this.showCancelConfirm = true;
  }

  dismissCancel() {
    this.orderToCancel = null;
    this.showCancelConfirm = false;
  }

  cancelOrder() {
    if (!this.orderToCancel) return;
    this.updatingOrderId = this.orderToCancel.id;
    this.orderService.cancelOrder(this.orderToCancel.id).subscribe({
      next: () => {
        this.notificationService.success('Order cancelled');
        this.dismissCancel();
        this.updatingOrderId = null;
        this.loadOrders();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to cancel order';
        this.notificationService.error(msg);
        this.updatingOrderId = null;
        this.dismissCancel();
        this.cdr.detectChanges();
      },
    });
  }

  // Buyer: reorder
  reorder(order: Order) {
    let addCount = 0;
    order.items.forEach(item => {
      this.cartService.addItem({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        sellerId: ''
      }).subscribe({
        next: () => {
          addCount++;
          if (addCount === order.items.length) {
            this.notificationService.success('Items added to cart');
          }
        },
        error: () => this.notificationService.error(`Could not add ${item.productName} to cart`),
      });
    });
  }

  // Seller: update status
  updateStatus(order: Order, status: OrderStatus) {
    this.updatingOrderId = order.id;
    this.orderService.updateStatus(order.id, status).subscribe({
      next: () => {
        this.notificationService.success('Order status updated');
        this.updatingOrderId = null;
        this.loadOrders();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to update status';
        this.notificationService.error(msg);
        this.updatingOrderId = null;
        this.cdr.detectChanges();
      },
    });
  }

  nextStatus(status: OrderStatus): OrderStatus | null {
    const flow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const idx = flow.indexOf(status);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  }

  statusBadgeClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
  }
}
