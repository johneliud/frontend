import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MediaService } from '../../services/media';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  seller: any = null;
  images: string[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private mediaService: MediaService,
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
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getSellerAvatar(): string | null {
    if (!this.seller?.avatar) return null;
    return `http://localhost:8083/api/users/avatars/${this.seller.avatar}`;
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
