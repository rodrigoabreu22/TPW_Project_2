import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-navbar-login',
  imports: [CommonModule,RouterModule,RouterLink],
  templateUrl: './navbar-login.component.html',
  styleUrl: './navbar-login.component.css'
})
export class NavbarLoginComponent {
  @Input() username: string = "";
  @Output() logoutEvent = new EventEmitter<void>();
  loginService: LoginService = inject(LoginService);

  constructor(private router: Router) { }

  logout() {
    this.logoutEvent.emit();
  }
}
