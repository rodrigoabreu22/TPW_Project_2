import { Component, Input, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../favorites.service';  // Importing the FavoritesService

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
  userId: number | null = null;
  isFavorite: boolean = false;
  myproduct: boolean = false;
  productService: ProductService = inject(ProductService);
  favoriteService: FavoritesService = inject(FavoritesService); // Injecting the FavoritesService

  constructor() {}

  ngOnInit(): void {
    if (this.isBrowser()) {
      const storedId = localStorage.getItem("id");
      console.log("User ID from localStorage: ", storedId);
      if (storedId !== null) {
        this.userId = parseInt(storedId, 10);
      }
    } else {
      console.warn('localStorage is not available in the current environment.');
    }

    if (this.userId && this.productId > 0) {
      this.productService
        .getProduct(this.productId)
        .then((fetchedProduct: Product) => {
          this.product = fetchedProduct;
          this.checkIfFavorite();
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

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Check if the product is in the user's favorites
  checkIfFavorite(): void {
    if (this.userId && this.productId) {
      this.favoriteService
        .getFavorites(this.userId)
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

    if (this.isFavorite) {
      // If the product is already a favorite, remove it
      this.favoriteService.removeFavorite(this.userId!, product.id)
        .then(() => {
          this.isFavorite = false;
          console.log(`Product ${product.name} removed from favorites.`);
        })
        .catch((error) => {
          console.error('Error removing favorite:', error);
        });
    } else {
      // If the product is not a favorite, add it
      this.favoriteService.addFavorite(this.userId!, product.id)
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
