import { Component, inject} from '@angular/core';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Offer } from '../offer';
import { OffersService } from '../offers.service';
import { OffersReceivedComponent } from '../offers-received/offers-received.component';
import { OffersSentComponent } from '../offers-sent/offers-sent.component';
import { OffersAcceptedComponent } from '../offers-accepted/offers-accepted.component';
import { OffersProcessedComponent } from '../offers-processed/offers-processed.component';

@Component({
  selector: 'app-offers-list',
  imports: [CommonModule, RouterModule, OffersReceivedComponent, OffersSentComponent, OffersAcceptedComponent, OffersProcessedComponent],
  templateUrl: './offers-list.component.html',
  styleUrl: './offers-list.component.css'
})
export class OffersListComponent {
  receivedOffers: Offer[] = [];
  sentOffers: Offer[] = [];
  acceptedOffers: Offer[] = [];
  processedOffers: Offer[] = [];
  offerService: OffersService = inject(OffersService);
  user_id = 0;
  token = "";

  constructor() {
    this.user_id = parseInt(localStorage.getItem("id") || "0", 10);
    this.token = localStorage.getItem("token") || "";
    this.offerService.getOffersByUser(this.user_id, this.token)
      .then((listOffers: Offer[][]) => {
        console.log(listOffers);
        this.receivedOffers = listOffers[0];
        this.sentOffers = listOffers[1];
        this.acceptedOffers = listOffers[2];
        this.processedOffers = listOffers[3];
      })
      .catch((error: any) => {
        console.error('Error getting offers:', error);
      });

  }

  acceptOffer(offer: Offer) {
    this.offerService.acceptOffer(offer.id, this.token)
      .then(() => {
        this.acceptedOffers.push(offer);
        this.receivedOffers = this.receivedOffers.filter(o => o.id !== offer.id);
      })
      .catch((error: any) => {
        console.error('Error accepting offer:', error);
      });
  }

  rejectOffer(offer: Offer) {
    this.offerService.rejectOffer(offer.id, this.token)
      .then(() => {
        this.receivedOffers = this.receivedOffers.filter(o => o.id !== offer.id);
      })
      .catch((error: any) => {
        console.error('Error rejecting offer:', error);
      });
  }

  cancelOffer(offer: Offer) {
    this.offerService.cancelOffer(offer.id, this.token)
      .then(() => {
        this.sentOffers = this.sentOffers.filter(o => o.id !== offer.id);
      })
      .catch((error: any) => {
        console.error('Error canceling offer:', error);
      });
  }

  counterOffer(offer: Offer) {
    this.offerService.counterOffer(offer.id, this.token)
      .then(() => {
        this.sentOffers = this.sentOffers.filter(o => o.id !== offer.id);
      })
      .catch((error: any) => {
        console.error('Error countering offer:', error);
      });
  }
}
