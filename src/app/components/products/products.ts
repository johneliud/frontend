import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductFilters } from '../../services/product';
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
  loading = true;
  error: string | null = null;

  filters: ProductFilters = {
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDir: 'asc'
  };

  search = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private productService: ProductService) {}

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
      maxPrice: this.maxPrice ?? undefined
    };

    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.filters.page = 0;
    this.loadProducts();
  }

  onSortChange() {
    this.loadProducts();
  }
}
