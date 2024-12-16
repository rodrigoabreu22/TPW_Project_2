import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wallet',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit, OnDestroy{
  loginService: LoginService = inject(LoginService);
  userService: UserService = inject(UserService);
  userProfile: UserProfile | undefined;
  activeForm: 'withdraw' | 'deposit' = 'withdraw';
  walletValue!: number;
  private subscription!: Subscription;

  withdrawalForm: FormGroup;
  depositForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.withdrawalForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
    });

    this.depositForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
    });

    this.initializeUser();
  }

  ngOnInit() {
    this.subscription = this.userService.walletValue$.subscribe((value) => {
      console.log('Wallet value changed:', value);
      this.walletValue = value;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async initializeUser() {
    try {
      this.userProfile = await this.loginService.getLoggedUser();
      this.walletValue = this.userProfile.wallet;
    } catch (error) {
      console.error('Error loading user', error);
      this.router.navigate(['authentication']);
    }
  }

  showForm(form: 'withdraw' | 'deposit'): void {
    this.activeForm = form;
  }

  async onWithdraw(): Promise<void> {
    const amount = parseFloat(this.withdrawalForm.get('amount')?.value); // Convert to number
  
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido!');
      return;
    }
  
    if (amount > this.userProfile!.wallet) {
      alert('Saldo insuficiente!');
      return;
    }
  
    const response = await this.userService.updateWallet(amount, 'withdraw');
    if (response == null) {
      alert('Erro ao retirar dinheiro!');
      return
    }
    alert('Dinheiro retirado com sucesso!');

    this.withdrawalForm.reset();
  }
  

  async onDeposit(): Promise<void> {
    const amount: number = Number(this.depositForm.get('amount')?.value);
  
    if (isNaN(amount)) {
      alert('Por favor, insira um valor válido!');
      return;
    }
  
    const response = await this.userService.updateWallet(amount, 'deposit');
    if (!response) {
      alert('Erro ao depositar dinheiro!');
      return
    }
    alert('Dinheiro depositado com sucesso!');

    this.depositForm.reset();
  }
  
}
