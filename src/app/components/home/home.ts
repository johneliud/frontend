import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { MediaService } from '../../services/media';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { Product } from '../../models/product';
import { ProductCarouselComponent } from '../shared/product-carousel/product-carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCarouselComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  @ViewChild('featuredCarousel') featuredCarousel!: ProductCarouselComponent;
  @ViewChild('latestCarousel') latestCarousel!: ProductCarouselComponent;

  featuredProducts: Product[] = [];
  latestProducts: Product[] = [];
  loading = true;
  featuredImages = new Map<string, string>();
  latestImages = new Map<string, string>();

  constructor(
    private productService: ProductService,
    private mediaService: MediaService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;

    this.productService.getProducts({ size: 8, sortBy: 'name', sortDir: 'asc' }).subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 8);
        this.loadFeaturedImages();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load featured products');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.productService.getProducts({ size: 8, sortBy: 'createdAt', sortDir: 'desc' }).subscribe({
      next: (products) => {
        this.latestProducts = products;
        this.loadLatestImages();
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load latest products');
        this.cdr.detectChanges();
      }
    });
  }

  loadFeaturedImages() {
    this.featuredProducts.forEach(product => {
      this.mediaService.getMediaByProduct(product.id).subscribe({
        next: (media) => {
          if (media.length > 0) {
            this.featuredImages.set(product.id, this.mediaService.getMediaUrl(media[0].id));
            if (this.featuredCarousel) {
              this.featuredCarousel.setProductImages(this.featuredImages);
            }
            this.cdr.detectChanges();
          }
        },
        error: () => {}
      });
    });
  }

  loadLatestImages() {
    this.latestProducts.forEach(product => {
      this.mediaService.getMediaByProduct(product.id).subscribe({
        next: (media) => {
          if (media.length > 0) {
            this.latestImages.set(product.id, this.mediaService.getMediaUrl(media[0].id));
            if (this.latestCarousel) {
              this.latestCarousel.setProductImages(this.latestImages);
            }
            this.cdr.detectChanges();
          }
        },
        error: () => {}
      });
    });
  }

  onAddToCart(event: { product: Product; quantity: number }) {
    const { product, quantity } = event;
    this.cartService.addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      sellerId: product.userId,
      imageUrl: this.featuredImages.get(product.id) || this.latestImages.get(product.id) || undefined
    }).subscribe({
      next: () => {
        const msg = quantity > 1 ? `${quantity}x ${product.name} added to cart` : `${product.name} added to cart`;
        this.notificationService.success(msg);
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to add to cart';
        this.notificationService.error(msg);
        this.cdr.detectChanges();
      }
    });
  }
}
