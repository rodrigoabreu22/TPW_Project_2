import { Injectable, inject } from '@angular/core';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private baseUrl :string = 'http://localhost:8080/ws/';

  constructor() { }

  async getFavorites(): Promise<Product[]>{
    //const userId = this.loginService.getLoggedUserId();
    //if (!userId) {
    //  throw new Error('User is not logged in.');
    //}
    //ws/users/<int:user_id>/favorites/
    //let url = `${this.baseUrl}users/${userId}/favorites`;
    const url = `${this.baseUrl}users/1/favorites`;
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
 }

 async addFavorite(): Promise<Product[]>{
  
  const url = `${this.baseUrl}users/1/favorites`;
  const data :Response = await fetch(url);
  return await data.json() ?? undefined;
}

async removeFavorite(productId: number): Promise<Product[]>{
  //const userId = this.loginService.getLoggedUserId();
    //if (!userId) {
    //  throw new Error('User is not logged in.');
    //}
  let userId=1
  let url = `${this.baseUrl}users/${userId}/favorites/${productId}`
  const data = await fetch(url, {method: "DELETE", headers?})
}

}
