import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private baseUrl: string = 'http://localhost:8080/ws/';

  constructor() {}

  async getFavorites(userId: number, token: string): Promise<any[]> {
    const url = `${this.baseUrl}users/${userId}/favorites/`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return await response.json();
  }

  async addFavorite(userId: number, productId: number, token: string): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/favorites/${productId}/`;  // productId is now required here
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to add favorite: ${response.statusText}`);
    }
  }

  async removeFavorite(userId: number, productId: number, token:string): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/favorites/${productId}/`;  // productId is now required here
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to remove favorite: ${response.statusText}`);
    }
  }
}

