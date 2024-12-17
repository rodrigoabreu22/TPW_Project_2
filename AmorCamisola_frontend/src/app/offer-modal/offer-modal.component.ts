import { Component, Input, Output, EventEmitter, inject, SimpleChanges } from '@angular/core';
import { Product } from '../product';
import { User } from '../user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';
import { Offer } from '../offer';

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
  @Input() offer_id: number = 0;
  @Input() offer_status: string = '';
  @Input() address: string = '';
  @Input() buyer: UserProfile | undefined;
  @Output() close = new EventEmitter<void>();
  @Output() submitOffer = new EventEmitter<Offer>();
  user: UserProfile | undefined;
  useProfileAddress: boolean = true;
  customAddress: string = this.address;
  walletBalance: number = 0;
  newWalletBalance: number = 0;


  ngOnChanges(changes: SimpleChanges) {
    console.log('Modal show value:', changes['show']);
  }
  
  constructor() {
    this.initializeUser();
    console.log(this.show);
  }


  async initializeUser() {
    this.user = await this.loginService.getLoggedUser();
    this.walletBalance = this.user?.wallet ?? 0;
    console.log('User:', this.user?.user);
    console.log('Seller:', this.product?.seller);
    console.log(this.product?.seller?.id === this.user?.user?.id)

    if (this.user?.user?.id && this.product?.seller?.id === this.user?.user?.id) {
      this.newWalletBalance = Number(this.walletBalance) + Number(this.offerValue);
    } else {
      this.newWalletBalance = Number(this.walletBalance) - Number(this.offerValue);
    }
  }

  checkBalance() {
    if (this.user?.user?.id && this.product?.seller?.id === this.user?.user?.id) {
      this.newWalletBalance = Number(this.walletBalance) + Number(this.offerValue);
    } else {
      this.newWalletBalance = Number(this.walletBalance) - Number(this.offerValue);
    }

    return this.newWalletBalance;
  }


  handleSubmit() {
    const selectedAddress = this.useProfileAddress ? this.user?.address : this.customAddress;
    let offer: Offer = {
      delivery_method: this.deliveryMethod,
      payment_method: this.paymentMethod,
      address: selectedAddress!,
      value: this.offerValue!,
      id: this.offer_id,
      product: this.product!,
      buyer: this.buyer!,
      offer_status: this.offer_status,
      delivered: false,
      sent_by: this.user?.user!,
      paid: false
    };
  
    this.submitOffer.emit(offer);
  
    console.log('Submitted Offer: ', offer);
  
    this.closeModal();
  }

  canSubmit(): boolean {
    const newBalance = this.checkBalance();
    return newBalance >= 0 && this.offerValue > 0;
  }

  isStoreCreditSelected(): boolean {
    return this.paymentMethod === 'store_credit'; // Adjust 'store_credit' to match your store credit value
  }
  
  

  closeModal() {
    this.show = false;
    this.close.emit();
  }

  onPaymentMethodChange() {
    if (this.paymentMethod === 'in_person') {
      this.deliveryMethod = 'in_person';
    }
  }

  
  
}
