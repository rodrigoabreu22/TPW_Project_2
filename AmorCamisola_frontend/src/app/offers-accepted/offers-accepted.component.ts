import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferCardComponent } from '../offer-card/offer-card.component';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offers-accepted',
  imports: [CommonModule, RouterModule, OfferCardComponent],
  templateUrl: './offers-accepted.component.html',
  styleUrl: './offers-accepted.component.css'
})
export class OffersAcceptedComponent {
  @Input() acceptedOffers: Offer[] = [];
  @Output() offerAccepted: EventEmitter<Offer[][]> = new EventEmitter<Offer[][]>();
  offersService: OffersService = inject(OffersService);

  userId: number | undefined = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!) : undefined;
  constructor() {}

  async confirmDelivery(offer: Offer | undefined) {
    const updatedOffers = await this.offersService.updateOffer(offer!, 'delivered', localStorage.getItem('token')!);
    if (updatedOffers) {
      this.offerAccepted.emit(updatedOffers);
    }
  }

  async confirmPayment(offer: Offer | undefined) {
    const updatedOffers = await this.offersService.updateOffer(offer!, 'paid', localStorage.getItem('token')!);
    if (updatedOffers) {
      this.offerAccepted.emit(updatedOffers);
    }
  }

  getActions(offer: Offer) {
    if (this.userId=== offer.buyer.user.id) {
      if (offer.delivered === true) {
        return [
          {
            label: 'Cancelar confirmação de entrega',
            handler: this.confirmDelivery.bind(this),
            color: 'btn-warning'
          }
        ];
      }
      return [
        {
          label: 'Confirmar entrega',
          handler: this.confirmDelivery.bind(this),
          color: 'btn-success'
        }
      ];
    } else {
      if (offer.paid === true) {
        return [
          {
            label: 'Cancelar confirmação de pagamento',
            handler: this.confirmPayment.bind(this),
            color: 'btn-warning'
          }
        ];
      }
      return [
        {
          label: 'Confirmar pagamento',
          handler: this.confirmPayment.bind(this),
          color: 'btn-success'
        }
      ];
    }
  }
}
