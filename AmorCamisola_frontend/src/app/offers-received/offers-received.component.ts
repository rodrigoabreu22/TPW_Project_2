import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferCardComponent } from '../offer-card/offer-card.component';
import { OffersService } from '../offers.service';
import { OfferModalComponent } from '../offer-modal/offer-modal.component';
import { Product } from '../product';

@Component({
  selector: 'app-offers-received',
  imports: [CommonModule, RouterModule, OfferCardComponent, OfferModalComponent],
  templateUrl: './offers-received.component.html',
  styleUrl: './offers-received.component.css'
})
export class OffersReceivedComponent {
  showModal: boolean = false; // Controls modal visibility
  selectedOffer: Offer | undefined;
  selectedProductName: Product | undefined;
  @Input() receivedOffers: Offer[] = [];
  @Output() offerReceived: EventEmitter<Offer[][]> = new EventEmitter<Offer[][]>();
  offersService: OffersService = new OffersService();
    userId: number | undefined = localStorage.getItem('id') ? parseInt(localStorage.getItem('id')!) : undefined;
    constructor() {}
  
    async rejectOffer(offer: Offer | undefined) {
      const updatedOffers = await this.offersService.updateOffer(offer!, 'rejected', localStorage.getItem('token')!);
      if (updatedOffers) {
        console.log(updatedOffers);
        this.offerReceived.emit(updatedOffers);
      }
    }

    async acceptOffer(offer: Offer | undefined) {
      const updatedOffers = await this.offersService.updateOffer(offer!, 'accepted', localStorage.getItem('token')!);
      if (updatedOffers) {
        console.log(updatedOffers);
        this.offerReceived.emit(updatedOffers);
      }
    }

    counterOffer(offer: Offer | undefined) {
      this.selectedOffer = offer;
      this.selectedProductName = offer?.product;
      this.showModal = true;
      console.log('counterOffer', offer);
      console.log('showModal', this.showModal);
      /*const updatedOffers = await this.offersService.updateOffer(offer!, 'countered', localStorage.getItem('token')!);
      if (updatedOffers) {
        console.log(updatedOffers);
        this.offerReceived.emit(updatedOffers);
      }
        */
    }

    async submitCounterOffer(offer: Offer) {
      console.log('submitCounterOffer', offer);
      const updatedOffers = await this.offersService.updateOffer(offer!, 'countered', localStorage.getItem('token')!);
      if (updatedOffers) {
        console.log(updatedOffers);
        this.offerReceived.emit(updatedOffers);
      }
    }
  
    getActions(offer: Offer) {
      return [
        {
          label: 'Aceitar',
          handler: this.acceptOffer.bind(this),
          color: 'btn-success'
        },
        {
          label: 'Rejeitar',
          handler: this.rejectOffer.bind(this),
          color: 'btn-danger'
        },
        {
          label: 'Contra-Oferta',
          handler: this.counterOffer.bind(this),
          color: 'btn-warning'
        }
      ]
    }

    closeModal() {
      this.showModal = false; // Reset modal state
    }

    onModalClick(event: MouseEvent): void {
      // Prevent the click event on the modal from propagating to the backdrop
      event.stopPropagation();
    }
    
}
