import {Component, inject} from '@angular/core';
import {ProductService} from "../product.service";
import {User} from "../user";
import {UserProfile} from "../user-profile";
import {Product} from "../product";
import {CommonModule} from "@angular/common";
import {RouterLink} from "@angular/router";
import {ProductComponent} from "../product/product.component";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})

export class UserProfileComponent {
  userprofile: UserProfile = {
    user: {} as User,
    address: '',
    phone: '',
    wallet: 0,
    image: '',
    image_base64: '',
  };

  followers: number = 0;
  following: number = 0;
  products: Product[] = [];
  load: boolean = true;

  productService: ProductService = inject(ProductService)

  constructor() {
    
  }
  
}