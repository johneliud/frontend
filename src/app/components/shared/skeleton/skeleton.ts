import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass" role="status" aria-label="Loading">
      @for (item of items; track $index) {
        <div class="bg-gray-200 rounded-lg animate-pulse" [style.height]="height" [style.width]="width"></div>
      }
    </div>
  `,
})
export class SkeletonComponent {
  @Input() count = 1;
  @Input() height = '200px';
  @Input() width = '100%';
  @Input() containerClass = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';

  get items() {
    return Array(this.count).fill(0);
  }
}

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div class="h-48 bg-gray-200 animate-pulse"></div>
      <div class="p-4 space-y-3">
        <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        <div class="flex justify-between items-center pt-2">
          <div class="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
        </div>
      </div>
    </div>
  `,
})
export class SkeletonCardComponent {}
