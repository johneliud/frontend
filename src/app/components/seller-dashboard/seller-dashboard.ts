import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
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
  loading = false;
  showForm = false;
  editMode = false;
  productForm: FormGroup;
  selectedProduct: Product | null = null;
  showDeleteConfirm = false;
  productToDelete: Product | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private notificationService: NotificationService
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
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load products');
        this.loading = false;
      }
    });
  }

  openCreateForm() {
    this.editMode = false;
    this.selectedProduct = null;
    this.productForm.reset();
    this.showForm = true;
  }

  openEditForm(product: Product) {
    this.editMode = true;
    this.selectedProduct = product;
    this.productForm.patchValue(product);
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.productForm.reset();
    this.selectedProduct = null;
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const productData = this.productForm.value;
    
    const request = this.editMode && this.selectedProduct
      ? this.productService.updateProduct(this.selectedProduct.id, productData)
      : this.productService.createProduct(productData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.editMode ? 'Product updated successfully' : 'Product created successfully'
        );
        this.closeForm();
        this.loadProducts();
      },
      error: () => {
        this.notificationService.error(
          this.editMode ? 'Failed to update product' : 'Failed to create product'
        );
      }
    });
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
      error: () => {
        this.notificationService.error('Failed to delete product');
        this.cancelDelete();
      }
    });
  }
}
