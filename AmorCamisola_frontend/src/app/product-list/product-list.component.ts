import { Component, OnInit, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { ProductComponent } from '../product/product.component';  
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductComponent], 
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnChanges {
  @Input() username: string = ""; // Username input for filtering products
  @Input() products: Product[] = []; // Allow passing external products dynamically
  isLoading: boolean = true; // Loading state

  productService: ProductService = inject(ProductService);

  constructor() {}

  ngOnInit(): void {
    if (this.username) {
      // Fetch products if username is provided
      console.log('Fetching products for username:', this.username);
      this.fetchProductsByUsername();
    } else {
      // Stop the loading spinner if products are passed externally
      this.isLoading = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['username'] && !changes['username'].firstChange) {
      this.isLoading = true;
      this.fetchProductsByUsername();
    }
  }

  private fetchProductsByUsername(): void {
    this.productService.getProductsByUsername(this.username)
      .then((products: Product[]) => {
        this.products = products;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        this.isLoading = false;
      });
  }
}
