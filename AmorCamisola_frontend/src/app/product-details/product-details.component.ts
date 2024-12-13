import { Component, Input, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserProfile } from '../user-profile';
import { UserService } from '../user.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  @Input() productId: number = 0;

  product: Product | null = null;
  sellerInfo: UserProfile | null = null;

  private productService: ProductService = inject(ProductService);
  private userService: UserService = inject(UserService);

  constructor(private route: ActivatedRoute) {
    this.productId = route.snapshot.params['id']
  }

  async ngOnInit(): Promise<void> {
    if (this.productId <= 0) {
      console.warn('Invalid or missing product ID.');
      return;
    }

    try {
      // Fetch product details
      this.product = await this.productService.getProduct(this.productId);

      // If the product has a seller, fetch seller info
      if (this.product.seller.username) {
        this.sellerInfo = await this.userService.getUser(this.product.seller.username);
      }
    } catch (error) {
      console.error('Error loading product or seller information:', error);
    }
  }
}
