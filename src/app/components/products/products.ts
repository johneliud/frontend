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
  productImages = new Map<string, string>();
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
      },
      error: (err) => {
        console.error('Failed loading products:', err);
        this.error = 'Failed to load products';
        this.loading = false;
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
}
