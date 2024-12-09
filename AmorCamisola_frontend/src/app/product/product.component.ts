import { Component, Input, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../user';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  @Input() productId: number = 0;

  product: Product | null = null;

  productService: ProductService = inject(ProductService);

  constructor() {}

  ngOnInit(): void {
    if (this.productId > 0) {
      this.productService
        .getProduct(this.productId)
        .then((fetchedProduct: Product) => {
          this.product = fetchedProduct;
        })
        .catch((error) => {
          console.error('Error fetching product:', error);
        });
    } else {
      console.warn('Invalid or missing product ID.');
    }
  }
}
