import { Component, Input, OnInit } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferCardComponent } from '../offer-card/offer-card.component';

@Component({
  selector: 'app-offers-accepted',
  imports: [CommonModule, RouterModule, OfferCardComponent],
  templateUrl: './offers-accepted.component.html',
  styleUrl: './offers-accepted.component.css'
})
export class OffersAcceptedComponent implements OnInit {
  @Input() acceptedOffers: Offer[] = [];
  userId: number | undefined = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!) : undefined;
  constructor() {}
  ngOnInit(): void {
    console.log('userId', this.userId);
  }

  confirmDelivery(id: number | undefined) {
    console.log('confirmDelivery', id);
  }

  confirmPayment(id: number | undefined) {
    console.log('confirmPayment', id);
  }

  getActions(offer: Offer) {
    if (this.userId=== offer.buyer.user.id) {
      return [
        {
          label: 'entrega',
          handler: this.confirmDelivery.bind(this)
        }
      ];
    } else {
      return [
        {
          label: 'pagamento',
          handler: this.confirmPayment.bind(this)
        }
      ];
    }
  }
}
