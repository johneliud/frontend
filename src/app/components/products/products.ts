import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService, ProductFilters } from '../../services/product';
import { MediaService } from '../../services/media';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { Product } from '../../models/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productImages = new Map<string, string>();
  productQuantities = new Map<string, number>();
  loading = true;
  error: string | null = null;

  filters: ProductFilters = {
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDir: 'asc',
  };

  search = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  category = '';
  availableOnly = false;
  sellerId = '';
  addingToCartId: string | null = null;

  constructor(
    private productService: ProductService,
    private mediaService: MediaService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = null;

    const filters: ProductFilters = {
      ...this.filters,
      search: this.search || undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      category: this.category || undefined,
      availableOnly: this.availableOnly || undefined,
      sellerId: this.sellerId || undefined,
    };

    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.loadProductImages();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed loading products:', err);
        this.error = 'Failed to load products';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadProductImages() {
    this.products.forEach(product => {
      this.mediaService.getMediaByProduct(product.id).subscribe({
        next: (media) => {
          if (media.length > 0) {
            const imageUrl = this.mediaService.getMediaUrl(media[0].id);
            this.productImages.set(product.id, imageUrl);
            this.cdr.detectChanges();
          } else {
            console.log(`No media found for product ${product.id}`);
          }
        },
        error: (err) => {
          console.error(`Error fetching media for product ${product.id}:`, err);
        }
      });
    });
  }

  onImageError(event: Event, productId: string) {
    console.error(`Image failed to load for product ${productId}`);
    this.productImages.delete(productId);
  }

  onSearch() {
    this.filters.page = 0;
    this.loadProducts();
  }

  onSortChange() {
    this.loadProducts();
  }

  viewProduct(productId: string) {
    this.router.navigate(['/products', productId]);
  }

  showFilters = false;

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  get isClient(): boolean {
    return this.authService.isAuthenticatedSignal() && this.authService.userRoleSignal() === 'client';
  }

  get activeFilters(): string[] {
    const tags: string[] = [];
    if (this.search) tags.push(`Search: ${this.search}`);
    if (this.category) tags.push(`Category: ${this.category}`);
    if (this.availableOnly) tags.push('In Stock Only');
    if (this.sellerId) tags.push(`Seller: ${this.sellerId}`);
    if (this.minPrice !== null) tags.push(`Min: KES ${this.minPrice}`);
    if (this.maxPrice !== null) tags.push(`Max: KES ${this.maxPrice}`);
    return tags;
  }

  clearFilter(tag: string) {
    if (tag.startsWith('Search:')) this.search = '';
    else if (tag.startsWith('Category:')) this.category = '';
    else if (tag === 'In Stock Only') this.availableOnly = false;
    else if (tag.startsWith('Seller:')) this.sellerId = '';
    else if (tag.startsWith('Min:')) this.minPrice = null;
    else if (tag.startsWith('Max:')) this.maxPrice = null;
    this.loadProducts();
  }

  getQuantity(productId: string): number {
    return this.productQuantities.get(productId) || 1;
  }

  incrementQuantity(productId: string, maxQuantity: number) {
    const current = this.getQuantity(productId);
    if (current < maxQuantity) {
      this.productQuantities.set(productId, current + 1);
    }
  }

  decrementQuantity(productId: string) {
    const current = this.getQuantity(productId);
    if (current > 1) {
      this.productQuantities.set(productId, current - 1);
    }
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation();
    this.addingToCartId = product.id;
    const quantity = this.getQuantity(product.id);
    this.cartService.addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      sellerId: product.userId,
      imageUrl: this.productImages.get(product.id)
    }).subscribe({
      next: () => {
        const msg = quantity > 1 
          ? `${quantity} ${product.name} added to cart`
          : `${product.name} added to cart`;
        this.notificationService.success(msg);
        this.productQuantities.set(product.id, 1);
        this.addingToCartId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to add to cart';
        this.notificationService.error(msg);
        this.addingToCartId = null;
        this.cdr.detectChanges();
      },
    });
  }
}
