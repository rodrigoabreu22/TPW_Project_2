import { Component, Input } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferCardComponent } from '../offer-card/offer-card.component';

@Component({
  selector: 'app-offers-received',
  imports: [CommonModule, RouterModule, OfferCardComponent],
  templateUrl: './offers-received.component.html',
  styleUrl: './offers-received.component.css'
})
export class OffersReceivedComponent {
  @Input() receivedOffers: Offer[] = [];
    userId: number | undefined = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!) : undefined;
    constructor() {}
    ngOnInit(): void {
    }
  
    rejectOffer(id: number | undefined) {
      console.log('rejectOffer', id);
    }

    acceptOffer(id: number | undefined) {
      console.log('acceptOffer', id);
    }

    counterOffer(id: number | undefined) {
      console.log('counterOffer', id);
    }
  
    getActions(offer: Offer) {
      return [
        {
          label: 'aceitar',
          handler: this.acceptOffer.bind(this),
          color: 'btn-success'
        },
        {
          label: 'rejeitar',
          handler: this.rejectOffer.bind(this),
          color: 'btn-danger'
        },
        {
          label: 'contra-oferta',
          handler: this.counterOffer.bind(this),
          color: 'btn-warning'
        }
      ]
    }
}
