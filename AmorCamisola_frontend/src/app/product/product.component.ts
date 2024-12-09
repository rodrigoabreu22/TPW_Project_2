import { Component, Input, inject } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import {Product} from "../product";
import {ProductService} from "../product.service";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  @Input() product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    team: '',
    seller: '',
    sold: false,
    is_active: false,
    image: '',
    image_base64: '',
  }
  @Input() layout: number = 0;
  productService: ProductService = inject(ProductService);

  constructor(){

  }
}
