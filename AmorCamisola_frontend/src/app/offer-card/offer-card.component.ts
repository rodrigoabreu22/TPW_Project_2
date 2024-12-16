import { Component, Input } from '@angular/core';
import { Offer } from '../offer';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css'],
  imports: [CommonModule, RouterModule],
})
export class OfferCardComponent {
  @Input() offer?: Offer;
  @Input() actions?: { label: string; handler: (offer: Offer) => void, color: string }[];

  constructor() {}

  getStatusLabel(status: string | undefined): string {
    
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Progresso';
      case 'cancelled':
        return 'Cancelado';
      case 'rejected':
        return 'Rejeitado';
      case 'accepted':
        if (this.offer?.buyer.user.id === Number(localStorage.getItem('id'))) {
          return 'Comprado';
        }
        return 'Vendido';
      default:
        return 'Sem Status';
    }
  }

  getPaymentMethodLabel(paymentMethod: string | undefined): string {
    switch (paymentMethod) {
      case 'store_credit':
        return 'Saldo da loja';
      case 'transfer':
        return 'Transferência bancária';
      case 'in_person':
        return 'Em pessoa';
      default:
        return 'Sem Método de Pagamento';
    }
  }

  getDeliveryMethodLabel(deliveryMethod: string | undefined): string {
    switch (deliveryMethod) {
      case 'shipment':
        return 'Envio Remoto';
      case 'in_person':
        return 'Em pessoa';
      default:
        return 'Sem Método de Entrega';
    }
  }

  getOfferValue(offerValue: number | undefined): string {
    return offerValue ? offerValue.toFixed(2) : '0.00';
  }
  
}
