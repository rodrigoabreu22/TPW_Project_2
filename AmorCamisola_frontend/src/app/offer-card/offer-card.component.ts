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
          if (this.offer?.paid && !this.offer?.delivered) {
            return 'Pago';
          }
          if (!this.offer?.paid) {
            return 'Pagamento pendente';
          }
          return 'Comprado';
        }
        if (this.offer?.delivered && !this.offer?.paid) {
          return 'Entregue';
        }
        if (!this.offer?.delivered) {
          return 'Entrega pendente';
        }
        return 'Vendido';
      default:
        return 'Sem Status';
    }
  }

  getColorLabel(status: string | undefined): string {
      switch (status) {
        case 'completed':
          return 'bg-success';
        case 'in_progress':
          return 'bg-info';
        case 'cancelled':
          return 'bg-danger';
        case 'rejected':
          return 'bg-danger';
        case 'accepted':
          if (this.offer?.buyer.user.id === Number(localStorage.getItem('id'))) {
            if (this.offer?.paid && !this.offer?.delivered) {
              return 'bg-success';
            }
            if (!this.offer?.paid) {
              return 'bg-warning';
            }
            return 'bg-success';
          }
          if (this.offer?.delivered && !this.offer?.paid) {
            return 'bg-success';
          }
          if (!this.offer?.delivered) {
            return 'bg-warning';
          }
          return 'bg-success';
        default:
          return 'bg-secondary';
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
