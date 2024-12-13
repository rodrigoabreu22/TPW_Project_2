import { Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private baseUrl: string = 'http://localhost:8080/ws/';

  constructor(private loginService: LoginService) {}

  async getFavorites(userId: number): Promise<any[]> {
    const url = `${this.baseUrl}users/${userId}/favorites/`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return await response.json();
  }

  async addFavorite(userId: number, productId: number): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/favorites/`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add favorite: ${response.statusText}`);
    }
  }

  async removeFavorite(userId: number, productId: number): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/favorites/`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to remove favorite: ${response.statusText}`);
    }
  }
}
