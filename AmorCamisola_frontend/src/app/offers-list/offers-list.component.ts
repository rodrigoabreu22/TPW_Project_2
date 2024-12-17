import { Component, inject} from '@angular/core';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Offer } from '../offer';
import { OffersService } from '../offers.service';
import { OffersReceivedComponent } from '../offers-received/offers-received.component';
import { OffersSentComponent } from '../offers-sent/offers-sent.component';
import { OffersAcceptedComponent } from '../offers-accepted/offers-accepted.component';
import { OffersProcessedComponent } from '../offers-processed/offers-processed.component';
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';

@Component({
  selector: 'app-offers-list',
  imports: [CommonModule, RouterModule, OffersReceivedComponent, OffersSentComponent, OffersAcceptedComponent, OffersProcessedComponent],
  templateUrl: './offers-list.component.html',
  styleUrl: './offers-list.component.css'
})
export class OffersListComponent {
  activeTab: 'sales' | 'purchases' = 'sales'; // Tracks the active tab
  receivedOffers: Offer[] = [];
  filteredReceivedOffers: Offer[] = [];
  sentOffers: Offer[] = [];
  filteredSentOffers: Offer[] = [];
  acceptedOffers: Offer[] = [];
  filteredAcceptedOffers: Offer[] = [];
  processedOffers: Offer[] = [];
  filteredProcessedOffers: Offer[] = [];
  offerService: OffersService = inject(OffersService);
  loginService: LoginService = inject(LoginService);
  currentUser: UserProfile | null = null;
  user_id = 0;
  token = "";

  constructor(private route: Router) {
    this.user_id = parseInt(localStorage.getItem("id") || "0", 10);
    this.token = localStorage.getItem("token") || "";
  
    this.offerService.getOffersByUser(this.user_id, this.token)
      .then((listOffers: Offer[][] | null) => {
        if (listOffers) {
          this.loginService.getLoggedUser()
            .then(user => {
              this.currentUser = user;
            })
            .catch(error => {
              console.error('Error fetching logged user:', error);
              this.route.navigate(['authentication']); // Redirect to authentication page
            });
  
          this.receivedOffers = listOffers[0];
          this.sentOffers = listOffers[1];
          this.acceptedOffers = listOffers[2];
          this.processedOffers = listOffers[3];
          this.filteredReceivedOffers = this.receivedOffers.filter(offer => offer.product.seller.id === this.user_id);
          this.filteredSentOffers = this.sentOffers.filter(offer => offer.product.seller.id === this.user_id);
          this.filteredAcceptedOffers = this.acceptedOffers.filter(offer => offer.product.seller.id === this.user_id);
          this.filteredProcessedOffers = this.processedOffers.filter(offer => offer.product.seller.id === this.user_id);
        } else {
          console.error('No offers found');
        }
      })
      .catch((error: any) => {
        console.error('Error getting offers:', error);
      });
  }
  


  switchTab(tab: 'sales' | 'purchases'): void {
    this.activeTab = tab;
    if (this.activeTab === 'sales') {
      this.filteredReceivedOffers = this.receivedOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
      this.filteredSentOffers = this.sentOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
      this.filteredAcceptedOffers = this.acceptedOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
      this.filteredProcessedOffers = this.processedOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
    }
    else {
      this.filteredReceivedOffers = this.receivedOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
      this.filteredSentOffers = this.sentOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
      this.filteredAcceptedOffers = this.acceptedOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
      this.filteredProcessedOffers = this.processedOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
    }
  }


  handleUpdates(offers: Offer[][]) {
    this.receivedOffers = [...offers[0]];
    this.sentOffers = [...offers[1]];
    this.acceptedOffers = [...offers[2]];
    this.processedOffers = [...offers[3]];
    if (this.activeTab === 'sales') {
      this.filteredReceivedOffers = this.receivedOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
      this.filteredSentOffers = this.sentOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
      this.filteredAcceptedOffers = this.acceptedOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
      this.filteredProcessedOffers = this.processedOffers.filter(offer => offer.product.seller.id === this.currentUser?.user.id);
    }
    else {
      this.filteredReceivedOffers = this.receivedOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
      this.filteredSentOffers = this.sentOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
      this.filteredAcceptedOffers = this.acceptedOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
      this.filteredProcessedOffers = this.processedOffers.filter(offer => offer.buyer.user.id === this.currentUser?.user.id);
    }
  }
}
