import { Component, Input } from '@angular/core';
import { Offer } from './offer';
import { CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-offers-accepted',
  imports: [CommonModule, RouterModule],
  templateUrl: './offers-accepted.component.html',
  styleUrl: './offers-accepted.component.css'
})
export class OffersAcceptedComponent {
  @Input() acceptedOffers: Offer[] = [];
  constructor() {}
}
