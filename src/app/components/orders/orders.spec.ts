import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { OrdersComponent } from './orders';
import { OrderService } from '../../services/order';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { Order } from '../../models/order';

const mockOrders: Order[] = [
  {
    id: 'order1',
    userId: 'user1',
    sellerId: 'seller1',
    items: [{ productId: 'p1', productName: 'Product A', price: 100, quantity: 2 }],
    totalAmount: 200,
    status: 'PENDING',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('OrdersComponent', () => {
  let fixture: ComponentFixture<OrdersComponent>;
  let component: OrdersComponent;

  const mockOrderService = {
    getOrders: vi.fn(() => of(mockOrders)),
    getSellerOrders: vi.fn(() => of([])),
    cancelOrder: vi.fn(),
    updateStatus: vi.fn(),
  };
  const mockAuthService = {
    userRoleSignal: () => 'client',
    isAuthenticatedSignal: () => true,
  };
  const mockCartService = {
    addItem: vi.fn(() => of({})),
    cartCount: () => 0,
  };
  const mockNotification = {
    success: vi.fn(),
    error: vi.fn(),
    show: vi.fn(),
  };

  beforeEach(async () => {
    mockOrderService.getOrders.mockReturnValue(of(mockOrders));
    mockOrderService.cancelOrder.mockReturnValue(of(mockOrders[0]));

    await TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: OrderService, useValue: mockOrderService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CartService, useValue: mockCartService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should load buyer orders on init', () => {
    expect(mockOrderService.getOrders).toHaveBeenCalled();
    expect(component.orders.length).toBe(1);
    expect(component.orders[0].id).toBe('order1');
  });

  it('should show cancel confirm dialog', () => {
    component.confirmCancel(mockOrders[0]);
    expect(component.showCancelConfirm).toBe(true);
    expect(component.orderToCancel).toBe(mockOrders[0]);
  });

  it('should dismiss cancel dialog', () => {
    component.confirmCancel(mockOrders[0]);
    component.dismissCancel();
    expect(component.showCancelConfirm).toBe(false);
    expect(component.orderToCancel).toBeNull();
  });

  it('cancelOrder should call orderService and show success', () => {
    component.orderToCancel = mockOrders[0];
    component.cancelOrder();
    expect(mockOrderService.cancelOrder).toHaveBeenCalledWith('order1');
    expect(mockNotification.success).toHaveBeenCalledWith('Order cancelled');
  });

  it('should show error when cancel fails', () => {
    mockOrderService.cancelOrder.mockReturnValue(
      throwError(() => ({ error: { message: 'Not allowed' } }))
    );
    component.orderToCancel = mockOrders[0];
    component.cancelOrder();
    expect(mockNotification.error).toHaveBeenCalledWith('Not allowed');
  });

  it('statusBadgeClass should return yellow class for PENDING', () => {
    expect(component.statusBadgeClass('PENDING')).toContain('yellow');
  });

  it('statusBadgeClass should return green class for DELIVERED', () => {
    expect(component.statusBadgeClass('DELIVERED')).toContain('green');
  });

  it('nextStatus should return CONFIRMED for PENDING', () => {
    expect(component.nextStatus('PENDING')).toBe('CONFIRMED');
  });

  it('nextStatus should return null for DELIVERED', () => {
    expect(component.nextStatus('DELIVERED')).toBeNull();
  });

  it('toggleExpand should expand and collapse orders', () => {
    expect(component.isExpanded('order1')).toBe(false);
    component.toggleExpand('order1');
    expect(component.isExpanded('order1')).toBe(true);
    component.toggleExpand('order1');
    expect(component.isExpanded('order1')).toBe(false);
  });
});
