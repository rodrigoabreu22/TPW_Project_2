import { Injectable } from '@angular/core';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl :string = 'http://localhost:8080/ws/';

  constructor() {

   }
  
   async getProduct(id: number): Promise<Product> {
    const url = `${this.baseUrl}products/${id}/`;
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }
   
   async getProducts(user_id: number | null): Promise<Product[]> {
    let url = `${this.baseUrl}products/`;
    if (user_id !== null && user_id!==0) {
      url += `?user_id=${user_id}`;
    }
    const response: Response = await fetch(url);
    return await response.json();
  }

  async getProductsByUsername(username: string | null): Promise<Product[]> {
    let url = `${this.baseUrl}products/`;
    if (username !== null && username!=="") {
      url += `?username=${username}`;
    }
    const response: Response = await fetch(url);
    return await response.json();
  }
  
   async createProduct(prod: Product): Promise<any> {
    const url = `${this.baseUrl}products/`;
    const data = await fetch(url, {
      method: "POST", headers: new Headers({"Content-Type": "application/json"}), body: JSON.stringify(prod)});
    return await data.json();
    }

    async filterProducts(filters: any): Promise<Product[]> {
      const params = new URLSearchParams();
      for (const key in filters) {
        if (filters[key]) {
          params.append(
            key,
            Array.isArray(filters[key]) ? filters[key].join(',') : filters[key]
          );
        }
      }
      const url = `${this.baseUrl}products/?${params.toString()}`;
      const response: Response = await fetch(url);
      return await response.json();
    }
  }

