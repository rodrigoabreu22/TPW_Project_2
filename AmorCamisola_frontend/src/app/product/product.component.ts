import { Component, Input, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Import Router
import { FavoritesService } from '../favorites.service';  
import { LoginService } from '../login.service';

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
  token: string | null = null;
  userId: number | null = null;
  isFavorite: boolean = false;
  myproduct: boolean = false;
  productService: ProductService = inject(ProductService);
  favoriteService: FavoritesService = inject(FavoritesService);
  loginService: LoginService = inject(LoginService);
  router: Router = inject(Router); // Inject Router

  constructor() {}

  ngOnInit(): void {
    if (this.isBrowser()) {
      const storedId = localStorage.getItem("id");
      this.token = localStorage.getItem("token");
      console.log("User ID from localStorage: ", storedId);
      if (storedId !== null) {
        this.userId = parseInt(storedId, 10);
      }
    } else {
      console.warn('localStorage is not available in the current environment.');
    }

    if (this.productId > 0) {
      console.log('Fetching product with ID:', this.productId);
      this.productService
        .getProduct(this.productId)
        .then((fetchedProduct: Product) => {
          this.product = fetchedProduct;

          // Check if it's the user's product
          if (this.product.seller.id === this.userId) {
            this.myproduct = true;
          }

          // Only check favorites if user is logged in
          if (this.userId != null) {
            this.checkIfFavorite();
          }
        })
        .catch((error) => {
          console.error('Error fetching product:', error);
        });
    } else {
      console.warn('Invalid or missing product ID.');
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Check if the product is in the user's favorites
  checkIfFavorite(): void {
    if (this.userId && this.productId) {
      this.favoriteService
        .getFavorites(this.userId, this.token!)
        .then((favorites: Product[]) => {
          this.isFavorite = favorites.some(product => product.id === this.productId);
        })
        .catch((error) => {
          console.error('Error fetching favorites:', error);
        });
    }
  }

  // Add or remove the product from the favorites
  toggleFavorite(event: Event, product: Product): void {
    event.stopPropagation(); // Prevents navigation

    // Redirect to login if the user is not logged in
    if (!this.userId) {
      console.warn("User not logged in. Redirecting to authentication page.");
      this.router.navigate(['/authentication']); // Adjust route as needed
      return;
    }

    if (this.isFavorite) {
      // If the product is already a favorite, remove it
      this.favoriteService.removeFavorite(this.userId, product.id, this.token!)
        .then(() => {
          this.isFavorite = false;
          console.log(`Product ${product.name} removed from favorites.`);
        })
        .catch((error) => {
          console.error('Error removing favorite:', error);
        });
    } else {
      // If the product is not a favorite, add it
      this.favoriteService.addFavorite(this.userId, product.id, this.token!)
        .then(() => {
          this.isFavorite = true;
          console.log(`Product ${product.name} added to favorites.`);
        })
        .catch((error) => {
          console.error('Error adding favorite:', error);
        });
    }
  }
}
