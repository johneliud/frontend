import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService } from './cart';
import { Cart } from '../models/cart';

const mockCart: Cart = {
  id: 'cart1',
  userId: 'user1',
  items: [
    { id: 'item1', productId: 'prod1', productName: 'Product One', price: 100, quantity: 2 },
  ],
  totalAmount: 200,
};

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCart should return cart and update count signal', () => {
    service.getCart().subscribe(cart => {
      expect(cart.id).toBe('cart1');
      expect(service.cartCount()).toBe(1);
    });
    httpMock.expectOne('http://localhost:8083/api/cart').flush({ data: mockCart });
  });

  it('addItem should post item and update count signal', () => {
    service.addItem('prod1', 2).subscribe(cart => {
      expect(cart.items.length).toBe(1);
      expect(service.cartCount()).toBe(1);
    });
    const req = httpMock.expectOne('http://localhost:8083/api/cart/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productId: 'prod1', quantity: 2 });
    req.flush({ data: mockCart });
  });

  it('updateItem should put new quantity', () => {
    const updated: Cart = { ...mockCart, items: [{ ...mockCart.items[0], quantity: 5 }] };
    service.updateItem('item1', 5).subscribe(cart => {
      expect(cart.items[0].quantity).toBe(5);
    });
    const req = httpMock.expectOne('http://localhost:8083/api/cart/items/item1');
    expect(req.request.method).toBe('PUT');
    req.flush({ data: updated });
  });

  it('removeItem should delete item and update count', () => {
    const emptyCart: Cart = { ...mockCart, items: [], totalAmount: 0 };
    service.removeItem('item1').subscribe(cart => {
      expect(cart.items.length).toBe(0);
      expect(service.cartCount()).toBe(0);
    });
    const req = httpMock.expectOne('http://localhost:8083/api/cart/items/item1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: emptyCart });
  });

  it('clearCart should delete cart and reset count to 0', () => {
    service.clearCart().subscribe(() => {
      expect(service.cartCount()).toBe(0);
    });
    httpMock.expectOne('http://localhost:8083/api/cart').flush({});
  });

  it('checkout should post and reset cart count', () => {
    const order = { id: 'order1', totalAmount: 200 };
    service.checkout({ deliveryAddress: { name: 'Test', address: 'Addr', city: 'City', phone: '123' } }).subscribe(o => {
      expect(o.id).toBe('order1');
      expect(service.cartCount()).toBe(0);
    });
    const req = httpMock.expectOne('http://localhost:8083/api/cart/checkout');
    expect(req.request.method).toBe('POST');
    req.flush({ data: order });
  });
});
