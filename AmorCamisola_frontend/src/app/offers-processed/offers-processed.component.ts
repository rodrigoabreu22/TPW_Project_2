import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferCardComponent } from '../offer-card/offer-card.component';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offers-processed',
  imports: [CommonModule, RouterModule, OfferCardComponent],
  templateUrl: './offers-processed.component.html',
  styleUrl: './offers-processed.component.css'
})
export class OffersProcessedComponent {
  @Input() processedOffers: Offer[] = [];
  @Output() offerProcessed: EventEmitter<Offer[][]> = new EventEmitter<Offer[][]>();
  offersService: OffersService = inject(OffersService);
    userId: number | undefined = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!) : undefined;
    constructor() {}
  
    async deleteOffer(offer: Offer | undefined) {
      const updatedOffers = await this.offersService.updateOffer(offer!, 'deleted', localStorage.getItem('token')!);
      if (updatedOffers) {
        console.log(updatedOffers);
        this.offerProcessed.emit(updatedOffers);
      }
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
