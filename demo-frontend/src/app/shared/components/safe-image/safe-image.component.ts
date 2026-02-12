import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-safe-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-container" [ngStyle]="{'background-color': '#f5f5f5'}">
      <img
        [src]="imageUrl"
        [alt]="altText"
        (error)="onImageError($event)"
        [ngStyle]="imageStyle"
        loading="lazy"
      />
    </div>
  `,
  styles: [`
    .image-container {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background-color: #f5f5f5;
    }
    
    img {
      max-width: 100%;
      height: auto;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }
  `]
})
export class SafeImageComponent implements OnChanges {
  @Input() imageUrl: string | undefined | null;
  @Input() altText: string = 'Product image';
  @Input() width: string = '100%';
  @Input() height: string = '200px';
  @Input() fallbackUrl: string = 'https://placehold.co/300x200?text=Image+Not+Available';

  imageStyle = {
    width: '100%',
    height: '100%',
    'object-fit': 'cover'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['width'] || changes['height']) {
      this.updateImageStyle();
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.fallbackUrl) {
      img.src = this.fallbackUrl;
      img.onerror = null; // Prevent infinite loop if fallback also fails
    }
  }

  private updateImageStyle(): void {
    this.imageStyle = {
      ...this.imageStyle,
      width: this.width,
      height: this.height,
      'object-fit': 'cover' as const
    };
  }
}
