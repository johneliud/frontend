import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, ProductFilters } from '../../services/product';
import { MediaService } from '../../services/media';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { Product } from '../../models/product';
import { ProductCardComponent } from '../shared/product-card/product-card';
import { SkeletonCardComponent } from '../shared/skeleton/skeleton';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, SkeletonCardComponent],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productImages = new Map<string, string>();
  loading = true;
  error: string | null = null;

  filters: ProductFilters = {
    page: 0,
    size: 20,
    sortBy: 'name',
    sortDir: 'asc',
  };

  search = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  category = '';
  availableOnly = false;
  sellerId = '';

  skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8];

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
        this.loadProductImages();
        this.loading = false;
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
          }
        },
        error: () => {}
      });
    });
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

  get isSeller(): boolean {
    return this.authService.userRoleSignal() === 'seller';
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

  onAddToCart(event: { product: Product; quantity: number }) {
    if (!this.authService.isAuthenticatedSignal()) {
      this.router.navigate(['/login']);
      return;
    }
    const { product, quantity } = event;
    this.cartService.addItem(product.id, quantity, this.productImages.get(product.id)).subscribe({
      next: () => {
        const msg = quantity > 1 ? `${quantity}x ${product.name} added to cart` : `${product.name} added to cart`;
        this.notificationService.success(msg);
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to add to cart';
        this.notificationService.error(msg);
        this.cdr.detectChanges();
      },
    });
  }
}
