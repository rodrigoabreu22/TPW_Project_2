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

   async getProducts(user_id: number): Promise<Product> {
    let url = `${this.baseUrl}products/`;
    if (user_id != null) {
        url += `?user_id=${user_id}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }

   async createProduct(prod: Product): Promise<any> {
    const url = `${this.baseUrl}products/`;
    const data = await fetch(url, {
      method: "POST", headers: new Headers({"Content-Type": "application/json"}), body: JSON.stringify(prod)});
    return await data.json();
    }
  }

