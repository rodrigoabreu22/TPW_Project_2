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
  myproduct: boolean = false;

  productService: ProductService = inject(ProductService);

  constructor() {}

  ngOnInit(): void {
    if (this.productId > 0) {
      this.productService
        .getProduct(this.productId)
        .then((fetchedProduct: Product) => {
          this.product = fetchedProduct;
          console.log("produto", fetchedProduct)
          if (this.product.seller.username == localStorage.getItem("username")){
            console.log("Meu produto")
            this.myproduct = true
          }
        })
        .catch((error) => {
          console.error('Error fetching product:', error);
        });
    } else {
      console.warn('Invalid or missing product ID.');
    }
  }

  addToFavorites(event: Event, product: Product): void {
    event.stopPropagation(); // Prevents navigation
    console.log(`Product ${product.name} added to favorites.`);
    // Add your logic for adding the product to the favorites list
  }
  
}
