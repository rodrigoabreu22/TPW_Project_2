import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferCardComponent } from '../offer-card/offer-card.component';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offers-sent',
  imports: [CommonModule, RouterModule, OfferCardComponent],
  templateUrl: './offers-sent.component.html',
  styleUrl: './offers-sent.component.css'
})
export class OffersSentComponent {
  @Input() sentOffers: Offer[] = [];
  @Output() offerSent: EventEmitter<Offer[][]> = new EventEmitter<Offer[][]>();
  offersService: OffersService = new OffersService();
    userId: number | undefined = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!) : undefined;
    constructor() {}
  
    async deleteOffer(offer: Offer | undefined) {
      const updatedOffers = await this.offersService.updateOffer(offer!, 'deleted', localStorage.getItem('token')!);
      if (updatedOffers) {
        console.log(updatedOffers);
        this.offerSent.emit(updatedOffers);
      }
    }
  
    getActions(offer: Offer) {
      return [
        {
          label: 'Cancelar negociação',
          handler: this.deleteOffer.bind(this),
          color: 'btn-danger'
        }
      ]
    }
}
