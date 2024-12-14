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
  @Input() actions?: { label: string; handler: (id: number | undefined) => void }[];

  constructor() {}
}
