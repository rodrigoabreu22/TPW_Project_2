import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private baseUrl: string = 'http://localhost:8080/ws/';

  constructor() {}

  async getFavorites(userId: number): Promise<any[]> {
    const url = `${this.baseUrl}users/${userId}/favorites/`;
    console.log("user url: ",url)
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return await response.json();
  }

  async addFavorite(userId: number, productId: number): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/favorites/${productId}/`;  // productId is now required here
    console.log("user url: ",url)
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to add favorite: ${response.statusText}`);
    }
  }

  async removeFavorite(userId: number, productId: number): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/favorites/${productId}/`;  // productId is now required here
    console.log("user url: ",url)
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to remove favorite: ${response.statusText}`);
    }
  }
}

