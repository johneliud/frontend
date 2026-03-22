import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../models/product';
import { NotificationService } from '../../../services/notification';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <!-- Product Image -->
      <div class="relative cursor-pointer overflow-hidden" [routerLink]="['/products', product.id]" [style.height.px]="imageHeight">
        <img
          *ngIf="imageUrl"
          [src]="imageUrl"
          [alt]="product.name"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          (error)="onImageError()"
        />
        <div *ngIf="!imageUrl" class="w-full h-full flex items-center justify-center bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <!-- Stock Badge -->
        <div class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold" 
             [class.bg-green-100]="product.quantity > 0" 
             [class.text-green-800]="product.quantity > 0" 
             [class.bg-red-100]="product.quantity === 0" 
             [class.text-red-800]="product.quantity === 0">
          {{ product.quantity > 0 ? 'In Stock' : 'Out of Stock' }}
        </div>
        
        <!-- Discount Badge -->
        <div *ngIf="discount" class="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
          -{{ discount }}%
        </div>
        
        <!-- Quick View Overlay -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span class="text-white font-medium bg-black/50 px-3 py-1 rounded-full">View Details</span>
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-4 flex flex-col flex-grow">
        <p *ngIf="product.category" class="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wide">{{ product.category }}</p>
        <h3 class="font-bold text-gray-800 mb-1 line-clamp-1">{{ product.name }}</h3>
        <p class="text-gray-500 text-sm mb-3 line-clamp-2 flex-grow">{{ product.description }}</p>
        
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-xl font-bold text-blue-600">
              KES {{ product.price | number:'1.2-2' }}
            </p>
            <p *ngIf="originalPrice" class="text-sm text-gray-400 line-through">
              KES {{ originalPrice | number:'1.2-2' }}
            </p>
          </div>
          <p class="text-sm text-gray-500">{{ product.quantity }} left</p>
        </div>

        <!-- Add to Cart Section -->
        <div *ngIf="showAddToCart" class="mt-auto">
          <div *ngIf="product.quantity > 0" class="flex items-center gap-2">
            <!-- Quantity Selector -->
            <div class="flex items-center border-2 border-gray-200 rounded-lg flex-shrink-0">
              <button
                (click)="decrementQuantity(); $event.stopPropagation()"
                class="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-l-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="w-10 text-center font-semibold text-sm">{{ quantity }}</span>
              <button
                (click)="incrementQuantity(); $event.stopPropagation()"
                class="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-r-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <!-- Add to Cart Button -->
            <button
              (click)="onAddToCart($event)"
              [disabled]="addingToCart"
              class="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg *ngIf="!addingToCart" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span *ngIf="addingToCart" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              {{ addingToCart ? 'Adding...' : 'Add' }}
            </button>
          </div>
          
          <!-- Out of Stock -->
          <div *ngIf="product.quantity === 0" class="text-center py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
            Out of Stock
          </div>
        </div>

        <!-- Wishlist Button -->
        <button *ngIf="showWishlist" (click)="onToggleWishlist($event)" class="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-colors" 
               [class.text-red-500]="isWishlisted" 
               [class.text-gray-400]="!isWishlisted"
               [attr.fill]="isWishlisted ? 'currentColor' : 'none'"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() imageUrl: string | null = null;
  @Input() showAddToCart = true;
  @Input() showWishlist = false;
  @Input() isWishlisted = false;
  @Input() imageHeight = 192;
  @Input() discount?: number;
  @Input() originalPrice?: number;
  
  @Output() addToCart = new EventEmitter<{ product: Product; quantity: number }>();
  @Output() wishlistToggle = new EventEmitter<Product>();
  
  quantity = 1;
  addingToCart = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  incrementQuantity() {
    if (this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onImageError() {
    this.imageUrl = null;
    this.cdr.detectChanges();
  }

  onAddToCart(event: Event) {
    event.stopPropagation();
    this.addingToCart = true;
    
    const item = {
      productId: this.product.id,
      productName: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      sellerId: this.product.userId,
      imageUrl: this.imageUrl || undefined
    };
    
    this.addToCart.emit({ product: this.product, quantity: this.quantity });
  }

  onToggleWishlist(event: Event) {
    event.stopPropagation();
    this.wishlistToggle.emit(this.product);
  }

  resetQuantity() {
    this.quantity = 1;
  }
}
