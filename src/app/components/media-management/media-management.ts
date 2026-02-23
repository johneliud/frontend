import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaService } from '../../services/media';
import { ProductService } from '../../services/product';
import { NotificationService } from '../../services/notification';
import { Media } from '../../models/media';
import { Product } from '../../models/product';

@Component({
  selector: 'app-media-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-management.html',
  styleUrl: './media-management.css',
})
export class MediaManagementComponent implements OnInit {
  media: Media[] = [];
  products: Product[] = [];
  loading = false;
  selectedProductId = '';
  selectedFile: File | null = null;
  uploading = false;
  mediaToDelete: Media | null = null;
  showDeleteConfirm = false;

  constructor(
    private mediaService: MediaService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadMedia();
  }

  loadProducts() {
    this.productService.getSellerProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load products');
      }
    });
  }

  loadMedia() {
    this.loading = true;
    const productId = this.selectedProductId || undefined;
    this.mediaService.getSellerMedia(productId).subscribe({
      next: (data) => {
        this.media = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load media');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onProductFilterChange() {
    this.loadMedia();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed');
        input.value = '';
        return;
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.error('File size exceeds 2MB limit');
        input.value = '';
        return;
      }
      
      this.selectedFile = file;
    }
  }

  uploadMedia() {
    if (!this.selectedFile || !this.selectedProductId) {
      this.notificationService.error('Please select a product and file');
      return;
    }

    this.uploading = true;
    this.mediaService.uploadMedia(this.selectedFile, this.selectedProductId).subscribe({
      next: () => {
        this.notificationService.success('Media uploaded successfully');
        this.selectedFile = null;
        this.uploading = false;
        this.loadMedia();
        this.cdr.detectChanges();
      },
      error: (err) => {
        let errorMessage = 'Failed to upload media';
        if (err.error?.errors && typeof err.error.errors === 'object') {
          errorMessage = Object.values(err.error.errors).join(', ');
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        this.notificationService.error(errorMessage);
        this.uploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(media: Media) {
    this.mediaToDelete = media;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.mediaToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteMedia() {
    if (!this.mediaToDelete) return;

    this.mediaService.deleteMedia(this.mediaToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Media deleted successfully');
        this.cancelDelete();
        this.loadMedia();
      },
      error: () => {
        this.notificationService.error('Failed to delete media');
        this.cancelDelete();
      }
    });
  }

  getMediaUrl(media: Media): string {
    return this.mediaService.getMediaUrl(media.id);
  }

  getProductName(productId: string): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  }
}
