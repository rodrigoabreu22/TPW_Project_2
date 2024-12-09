import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'], // Corrected typo from `styleUrl` to `styleUrls`
})
export class ProductComponent implements OnInit {
  @Input() productId: number | null = null; // Allow for null values

  product: Product | null = null; // Initially null until data is fetched
  productService: ProductService = inject(ProductService);

  constructor() {}

  ngOnInit(): void {
    // Ensure productId is valid before attempting to fetch data
    if (this.productId && this.productId > 0) {
      this.loadProduct();
    } else {
      console.warn('Invalid or missing product ID:', this.productId);
    }
  }

  async loadProduct(): Promise<void> {
    try {
      const fetchedProduct = await this.productService.getProduct(this.productId!);
      this.product = fetchedProduct;
    } catch (error) {
      console.error('Error fetching product:', error);
      this.product = null; // Handle API error gracefully by setting product to null
    }
  }
}
