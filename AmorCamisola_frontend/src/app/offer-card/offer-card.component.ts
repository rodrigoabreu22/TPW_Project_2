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
      case 'sold':
        return 'Vendido';
      default:
        return 'Sem Status';
    }
  }
  
}
