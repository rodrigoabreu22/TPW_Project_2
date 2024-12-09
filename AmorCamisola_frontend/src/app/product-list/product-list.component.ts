import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = []; // Array to hold the list of products
  isLoading: boolean = true; // Flag to indicate loading state

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      this.products = await this.productService.getProducts(null); // Fetch all products
      this.isLoading = false; // Once products are loaded, set loading to false
    } catch (error) {
      console.error('Error fetching products:', error);
      this.isLoading = false; // Set loading to false even on error
    }
  }
}

