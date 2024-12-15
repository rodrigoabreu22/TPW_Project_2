import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar-login',
  imports: [CommonModule,RouterModule,RouterLink],
  templateUrl: './navbar-login.component.html',
  styleUrl: './navbar-login.component.css'
})
export class NavbarLoginComponent {
  @Input() username: string = "";

  constructor() { }
}
