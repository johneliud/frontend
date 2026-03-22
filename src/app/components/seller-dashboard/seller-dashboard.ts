import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { MediaService } from '../../services/media';
import { NotificationService } from '../../services/notification';
import { Product } from '../../models/product';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css',
})
export class SellerDashboardComponent implements OnInit {
  products: Product[] = [];
  productImages = new Map<string, string>();
  loading = false;
  showForm = false;
  editMode = false;
  productForm: FormGroup;
  selectedProduct: Product | null = null;
  showDeleteConfirm = false;
  productToDelete: Product | null = null;

  selectedImageFile: File | null = null;
  selectedImagePreview: string | null = null;
  uploading = false;
  submitting = false;
  imageError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private mediaService: MediaService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getSellerProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loadProductImages();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load products');
        this.loading = false;
        this.cdr.detectChanges();
      }
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
        error: () => {}
      });
    });
  }

  openCreateForm() {
    this.editMode = false;
    this.selectedProduct = null;
    this.productForm.reset();
    this.clearImageSelection();
    this.showForm = true;
  }

  openEditForm(product: Product) {
    this.editMode = true;
    this.selectedProduct = product;
    this.productForm.patchValue(product);
    this.selectedImageFile = null;
    this.selectedImagePreview = this.productImages.get(product.id) || null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.productForm.reset();
    this.selectedProduct = null;
    this.clearImageSelection();
  }

  clearImageSelection() {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.imageError = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  processFile(file: File) {
    this.imageError = null;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.imageError = 'Please upload a valid image (PNG, JPG, JPEG, or WEBP)';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.imageError = 'Image size must be less than 2MB';
      return;
    }

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImagePreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.imageError = null;
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.submitting = true;
    const productData = this.productForm.value;

    if (this.editMode && this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct.id, productData).subscribe({
        next: (response) => {
          if (this.selectedImageFile) {
            this.uploadImage(response.id);
          } else {
            this.finishSubmit();
          }
        },
        error: (err) => {
          this.handleError(err, 'update');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: (response) => {
          if (this.selectedImageFile) {
            this.uploadImage(response.id);
          } else {
            this.finishSubmit();
          }
        },
        error: (err) => {
          this.handleError(err, 'create');
        }
      });
    }
  }

  uploadImage(productId: string) {
    if (!this.selectedImageFile) {
      this.finishSubmit();
      return;
    }

    this.uploading = true;
    this.mediaService.uploadMedia(this.selectedImageFile, productId).subscribe({
      next: () => {
        this.finishSubmit();
      },
      error: (err) => {
        this.uploading = false;
        this.submitting = false;
        this.notificationService.error('Product saved but image upload failed');
        this.closeForm();
        this.loadProducts();
        this.cdr.detectChanges();
      }
    });
  }

  finishSubmit() {
    this.uploading = false;
    this.submitting = false;
    this.notificationService.success(
      this.editMode ? 'Product updated successfully' : 'Product created successfully'
    );
    this.closeForm();
    this.loadProducts();
  }

  handleError(err: any, action: 'create' | 'update') {
    this.submitting = false;
    let errorMessage = action === 'update' ? 'Failed to update product' : 'Failed to create product';
    
    if (err.error?.errors && typeof err.error.errors === 'object') {
      errorMessage = Object.values(err.error.errors).join(', ');
    } else if (err.error?.message) {
      errorMessage = err.error.message;
    }
    
    this.notificationService.error(errorMessage);
    this.cdr.detectChanges();
  }

  confirmDelete(product: Product) {
    this.productToDelete = product;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.productToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteProduct() {
    if (!this.productToDelete) return;

    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Product deleted successfully');
        this.cancelDelete();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.notificationService.error('Failed to delete product');
        this.cancelDelete();
      }
    });
  }
}
