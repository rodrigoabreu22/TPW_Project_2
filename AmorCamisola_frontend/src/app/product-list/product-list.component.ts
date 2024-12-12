import { Component, OnInit, inject, Input } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { ProductComponent } from '../product/product.component';  
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductComponent], 
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  @Input() username: string = "";
  products: Product[] = [];
  isLoading: boolean = true;
  productService: ProductService = inject(ProductService);

  constructor() {}

  ngOnInit(): void {
    this.productService.getProductsByUsername(this.username)
      .then((products: Product[]) => {
        this.products = products;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        this.isLoading = false;
      });
  }
}

