import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  constructor() { }

  async getOffers(): Promise<any[]> {
    const url = 'http://localhost:8080/ws/offers/';
    const response: Response = await fetch(url);
    return await response.json();
  }

  async getOffersByUser(user_id: number, token: string): Promise<any[]> {
    const url = `http://localhost:8080/ws/offers/?user_id=${user_id}`;
    const response: Response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    return await response.json();
  }

  async createOffer(offer: any, token:string): Promise<any> {
    const url = 'http://localhost:8080/ws/offers/';
    const data = await fetch(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Token ${token}`}),
      body: JSON.stringify(offer),
    });
    return await data.json();
  }

  async acceptOffer(offer: any, token:string): Promise<any> {
    const url = 'http://localhost:8080/ws/acceptoffers/';
    const data = await fetch(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Token ${token}`}),
      body: JSON.stringify(offer),
    });
    return await data.json();
  }

  async counterOffer(offer: any, token:string): Promise<any> {
    const url = 'http://localhost:8080/ws/counteroffers/';
    const data = await fetch(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Token ${token}`}),
      body: JSON.stringify(offer),
    });
    return await data.json();
  }

  async rejectOffer(offer: any, token:string): Promise<any> {
    const url = 'http://localhost:8080/ws/rejectoffers/';
    const data = await fetch(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Token ${token}`}),
      body: JSON.stringify(offer),
    });
    return await data.json();
  }

  async cancelOffer(offer_id: number, token:string): Promise<void> {
    const url = `http://localhost:8080/ws/offers/${offer_id}/`;
    await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
  }

  async getOffer(offer_id: number, token:string): Promise<any> {
    const url = `http://localhost:8080/ws/offers/${offer_id}/`;
    const response: Response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    return await response.json();
  }




}
