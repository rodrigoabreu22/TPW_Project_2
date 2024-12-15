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
import { LoginService } from '../login.service';

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
  loginService: LoginService = inject(LoginService);
  user_id = 0;
  token = "";

  constructor() {
    this.user_id = parseInt(localStorage.getItem("id") || "0", 10);
    this.token = localStorage.getItem("token") || "";
    this.offerService.getOffersByUser(this.user_id, this.token)
      .then((listOffers: Offer[][] | null) => {
        if (listOffers) {
          console.log("USER ATUAL", this.loginService.getLoggedUser());
          console.log(listOffers);
          this.receivedOffers = listOffers[0];
          this.sentOffers = listOffers[1];
          this.acceptedOffers = listOffers[2];
          this.processedOffers = listOffers[3];
        } else {
          console.error('No offers found');
        }
      })
      .catch((error: any) => {
        console.error('Error getting offers:', error);
      });

  }

  handleUpdates(offers: Offer[][]) {
    this.receivedOffers = [...offers[0]];
    this.sentOffers = [...offers[1]];
    this.acceptedOffers = [...offers[2]];
    this.processedOffers = [...offers[3]];
  }
}
