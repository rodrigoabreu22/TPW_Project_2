import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModeratorService {

  private baseUrl: string = 'http://localhost:8080/ws/';

  constructor() { }

  async deleteProduct(productId: number, token: string): Promise<void> {
    const url = `${this.baseUrl}products/${productId}/delete`; // Adjust the endpoint as per your backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
  
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }
  }

  async toggleBanUser(userId: number, isActive: boolean, token: string): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/toggle-ban/`;  // Use '/toggle-ban/' instead of '/ban'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to ${isActive ? 'ban' : 'unban'} user: ${response.statusText}`);
    }
  }

}
