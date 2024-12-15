import { Injectable } from '@angular/core';
import { Offer } from './offer';

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

  async getOffersByUser(user_id: number, token: string): Promise<Offer[][] | null> {
    const url = `http://localhost:8080/ws/offers/?user_id=${user_id}`;
    const response: Response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    //process response and create array that separates all types of offers
    const offers = await response.json();
    const receivedOffers = offers.offers_received;
    const sentOffers = offers.offers_made;
    const acceptedOffers = offers.offers_accepted;
    const processedOffers = offers.offers_processed;
    return [receivedOffers, sentOffers, acceptedOffers, processedOffers];
  }

  async updateOffer(offer: Offer, action: string, token:string): Promise<Offer[][] | null> {
    const url = 'http://localhost:8080/ws/offers/';
    const data = await fetch(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Token ${token}`}),
      body: JSON.stringify({'offer': offer, 'action': action}),
    });
    if (!data.ok) {
      console.error('Error updating offer:', await data.text());
    }
    if (!data.ok) {
      return null;
    }
    const offers = await data.json();
    const receivedOffers = offers.offers_received;
    const sentOffers = offers.offers_made;
    const acceptedOffers = offers.offers_accepted;
    const processedOffers = offers.offers_processed;
    return [receivedOffers, sentOffers, acceptedOffers, processedOffers];
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
