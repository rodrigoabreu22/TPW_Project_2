import { Component, OnInit } from '@angular/core';
import { FavoritesService } from '../favorites.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { ProductComponent } from '../product/product.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, ProductComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {
  favorites: Product[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  userId: number | null = null;

  constructor(private favoritesService: FavoritesService) {}

  async ngOnInit(): Promise<void> {
    if (this.isBrowser()) {
      const storedId = localStorage.getItem("id");
      if (this.userId === storedId) {
        console.log("Banana");
      }
    } else {
      console.warn("localStorage não está disponível no ambiente atual.");
    }
    try {
      if (this.userId !== null) {
        this.favorites = await this.favoritesService.getFavorites(this.userId);
      } else {
        throw new Error('User ID is null');
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      this.error = 'Failed to load favorite products. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } 

}
