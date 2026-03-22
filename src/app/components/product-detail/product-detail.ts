import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MediaService } from '../../services/media';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { AuthModalService } from '../../services/auth-modal.service';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit {
  private authModalService = inject(AuthModalService);
  
  product: any = null;
  seller: any = null;
  images: string[] = [];
  currentImageIndex = 0;
  lightboxOpen = false;
  loading = true;
  error: string | null = null;
  quantity = 1;
  addingToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private mediaService: MediaService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(productId: string) {
    this.http.get<any>(`http://localhost:8083/api/products/${productId}`).subscribe({
      next: (response) => {
        this.product = response.data;
        this.loadSeller(this.product.userId);
        this.loadImages(productId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load product:', err);
        this.error = 'Product not found';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSeller(userId: string) {
    this.http.get<any>(`http://localhost:8083/api/users/${userId}`).subscribe({
      next: (response) => {
        this.seller = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadImages(productId: string) {
    this.mediaService.getMediaByProduct(productId).subscribe({
      next: (media) => {
        this.images = media.map(m => this.mediaService.getMediaUrl(m.id));
        this.currentImageIndex = 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  previousImage() {
    this.currentImageIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : this.images.length - 1;
  }

  nextImage() {
    this.currentImageIndex = this.currentImageIndex < this.images.length - 1 ? this.currentImageIndex + 1 : 0;
  }

  openLightbox() {
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  getSellerAvatar(): string | null {
    if (!this.seller?.avatar) return null;
    return `http://localhost:8083/api/users/avatars/${this.seller.avatar}`;
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  get isClient(): boolean {
    return this.authService.isAuthenticatedSignal() && this.authService.userRoleSignal() === 'client';
  }

  get isSeller(): boolean {
    return this.authService.userRoleSignal() === 'seller';
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  incrementQuantity() {
    if (this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  addToCart() {
    if (!this.authService.isAuthenticated()) {
      this.authModalService.openSignin();
      return;
    }
    if (!this.product) return;
    this.addingToCart = true;
    this.cartService.addItem({
      productId: this.product.id,
      productName: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      sellerId: this.product.userId,
      imageUrl: this.images[0] || undefined
    }).subscribe({
      next: () => {
        this.notificationService.success(`${this.product.name} added to cart`);
        this.addingToCart = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to add to cart';
        this.notificationService.error(msg);
        this.addingToCart = false;
        this.cdr.detectChanges();
      },
    });
  }
}
