import { Component, Input, Output, EventEmitter, inject, SimpleChanges } from '@angular/core';
import { Product } from '../product';
import { User } from '../user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';

@Component({
  selector: 'app-offer-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-modal.component.html',
  styleUrls: ['./offer-modal.component.css']
})
export class OfferModalComponent {
  loginService: LoginService = inject(LoginService);

  // Options for select dropdowns
  deliveryMethodOptions: [string, string][] = [
    ['shipment', 'Envio Remoto'],
    ['in_person', 'Em pessoa']
  ];

  paymentMethodOptions: [string, string][] = [
    ['store_credit', 'Saldo da loja'],
    ['transfer', 'Transferência bancária'],
    ['in_person', 'Em pessoa']
  ];

  @Input() product: Product | undefined;
  @Input() show: boolean = false;
  @Input() deliveryMethod: string = this.deliveryMethodOptions[0][0];
  @Input() paymentMethod: string = this.paymentMethodOptions[0][0];
  @Input() offerValue: number = 0;
  @Output() close = new EventEmitter<void>();
  user: UserProfile | undefined;

  ngOnChanges(changes: SimpleChanges) {
    console.log('Modal show value:', changes['show']);
  }
  
  constructor() {
    this.initializeUser();
    console.log(this.show);
  }

  async initializeUser() {
    this.user = await this.loginService.getLoggedUser();
  }

  @Output() submitOffer = new EventEmitter<{
    deliveryMethod: string;
    paymentMethod: string;
    deliveryLocation: string;
    offerValue: number;
  }>();

  handleSubmit() {
    this.submitOffer.emit({
      deliveryMethod: this.deliveryMethod,
      paymentMethod: this.paymentMethod,
      deliveryLocation: '',
      offerValue: this.offerValue,
    });

    console.log('Submitted Offer: ', {
      deliveryMethod: this.deliveryMethod,
      paymentMethod: this.paymentMethod,
      deliveryLocation: '',
      offerValue: this.offerValue,
    });

    this.closeModal();
  }

  closeModal() {
    this.show = false;
    this.close.emit();
  }
}
