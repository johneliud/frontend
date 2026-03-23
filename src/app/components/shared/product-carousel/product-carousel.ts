import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../models/product';
import { ProductCardComponent } from '../product-card/product-card';
import { SkeletonCardComponent } from '../skeleton/skeleton';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="relative group/carousel">
      <div *ngIf="title" class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ title }}</h2>
          <p *ngIf="subtitle" class="text-gray-500 text-sm mt-1">{{ subtitle }}</p>
        </div>
        <a *ngIf="viewAllLink" [routerLink]="viewAllLink" class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-skeleton-card *ngFor="let item of skeletonItems"></app-skeleton-card>
      </div>

      <div *ngIf="!loading && products.length > 0" class="relative overflow-hidden">
        <div class="flex gap-6 transition-transform duration-300 ease-out" 
             [style.transform]="'translateX(-' + scrollPosition + 'px)'">
          
          <div *ngFor="let product of products" class="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4" [style.width.px]="cardWidth">
            <app-product-card
              [product]="product"
              [imageUrl]="getProductImage(product.id)"
              [showAddToCart]="showAddToCart"
              [imageHeight]="imageHeight"
              (addToCart)="onAddToCart($event)"
            ></app-product-card>
          </div>
        </div>

        <button
          *ngIf="showNavigation && canScrollLeft"
          (click)="scrollLeft()"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          *ngIf="showNavigation && canScrollRight"
          (click)="scrollRight()"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div *ngIf="showDots && products.length > visibleCount" class="flex justify-center gap-2 mt-6">
          <button
            *ngFor="let dot of dotCount; let i = index"
            (click)="scrollToIndex(i)"
            class="w-2 h-2 rounded-full transition-all"
            [class.bg-blue-600]="currentIndex === i"
            [class.bg-gray-300]="currentIndex !== i"
            [class.w-4]="currentIndex === i"
          ></button>
        </div>
      </div>

      <div *ngIf="!loading && products.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-gray-500">{{ emptyMessage }}</p>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ProductCarouselComponent {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() viewAllLink: string | null = null;
  @Input() showAddToCart = true;
  @Input() showNavigation = true;
  @Input() showDots = true;
  @Input() imageHeight = 192;
  @Input() cardWidth = 280;
  @Input() visibleCount = 4;
  @Input() scrollAmount = 300;
  @Input() emptyMessage = 'No products available';
  
  @Output() productAddToCart = new EventEmitter<{ product: Product; quantity: number; done: () => void }>();

  productImages = new Map<string, string>();
  
  scrollPosition = 0;
  currentIndex = 0;
  canScrollLeft = false;
  canScrollRight = true;

  get skeletonItems() {
    return Array(Math.min(this.visibleCount, 4)).fill(0);
  }

  get dotCount() {
    return Array(Math.ceil(this.products.length / this.visibleCount)).fill(0);
  }

  constructor(private cdr: ChangeDetectorRef) {}

  getProductImage(productId: string): string | null {
    return this.productImages.get(productId) || null;
  }

  setProductImages(images: Map<string, string>) {
    this.productImages = images;
    this.cdr.detectChanges();
  }

  scrollLeft() {
    const maxScroll = (this.products.length - this.visibleCount) * (this.cardWidth + 24);
    this.scrollPosition = Math.max(0, this.scrollPosition - this.scrollAmount);
    this.updateScrollState();
  }

  scrollRight() {
    const maxScroll = (this.products.length - this.visibleCount) * (this.cardWidth + 24);
    this.scrollPosition = Math.min(maxScroll, this.scrollPosition + this.scrollAmount);
    this.updateScrollState();
  }

  scrollToIndex(index: number) {
    const maxScroll = (this.products.length - this.visibleCount) * (this.cardWidth + 24);
    this.scrollPosition = Math.min(maxScroll, index * this.scrollAmount);
    this.currentIndex = index;
    this.updateScrollState();
  }

  updateScrollState() {
    const maxScroll = (this.products.length - this.visibleCount) * (this.cardWidth + 24);
    this.canScrollLeft = this.scrollPosition > 0;
    this.canScrollRight = this.scrollPosition < maxScroll && maxScroll > 0;
    this.currentIndex = Math.floor(this.scrollPosition / (this.cardWidth + 24));
    this.cdr.detectChanges();
  }

  onAddToCart(event: { product: Product; quantity: number; done: () => void }) {
    this.productAddToCart.emit(event);
  }

}
