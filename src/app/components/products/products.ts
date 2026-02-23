import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductFilters } from '../../services/product';
import { MediaService } from '../../services/media';
import { Product } from '../../models/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productImages: Map<string, string> = new Map();
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

  constructor(
    private productService: ProductService,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef,
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
            this.productImages.set(product.id, this.mediaService.getMediaUrl(media[0].id));
            this.cdr.detectChanges();
          }
        },
        error: () => {
          // Silently fail
        }
      });
    });
  }

  getProductImage(productId: string): string | null {
    return this.productImages.get(productId) || null;
  }

  onImageError(event: Event, productId: string) {
    this.productImages.delete(productId);
  }

  onSearch() {
    this.filters.page = 0;
    this.loadProducts();
  }

  onSortChange() {
    this.loadProducts();
  }
}
