import { Component, Input } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferCardComponent } from '../offer-card/offer-card.component';

@Component({
  selector: 'app-offers-sent',
  imports: [CommonModule, RouterModule, OfferCardComponent],
  templateUrl: './offers-sent.component.html',
  styleUrl: './offers-sent.component.css'
})
export class OffersSentComponent {
  @Input() sentOffers: Offer[] = [];
    userId: number | undefined = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!) : undefined;
    constructor() {}
    ngOnInit(): void {
    }
  
    deleteOffer(id: number | undefined) {
      console.log('deleteOffer', id);
    }
  
    getActions(offer: Offer) {
      return [
        {
          label: 'apagar',
          handler: this.deleteOffer.bind(this),
          color: 'btn-danger'
        }
      ]
    }
}
