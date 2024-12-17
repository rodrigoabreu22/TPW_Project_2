import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ProductService } from '../product.service';
import { Product } from '../product';
import { UserService } from '../user.service';
import { UserProfile } from '../user-profile';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publish-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './publish-product.component.html',
  styleUrls: ['./publish-product.component.css'],
})
export class PublishProductComponent implements OnInit {
  product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    team: '',
    seller: { id: 0, username: '', email: '', first_name: '', last_name: '', is_active: true },
    sold: false,
    is_active: true,
    image: '',
    image_base64: '',
    category: null,
    size: null,
  };

  categories: string[] = ['Camisola', 'Calção', 'Meia', 'Chuteira'];
  sizeOptions: { [key: string]: string[] } = {
    'Camisola': ['XS', 'S', 'M', 'L', 'XL'],
    'Calção': ['XS', 'S', 'M', 'L', 'XL'],
    'Meia': ['XS', 'S', 'M', 'L', 'XL'],
    'Chuteira': ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'],
  };
  sizeList: string[] = [];

  productService: ProductService = inject(ProductService);
  userService: UserService = inject(UserService);
  loginService: LoginService = inject(LoginService);
  router: Router = inject(Router);  // Inject the Router for navigation

  constructor() {}

  ngOnInit(): void {
    this.updateSizeOptions();
    this.setSellerData();
  }

  async setSellerData(): Promise<void> {
    try {

      this.loginService.getLoggedUser()
        .then(user => {
          if (user) {
            this.product.seller = user.user;
            console.log("USER ATUAL", user);
          }
        })
        .catch(error => {
          console.error('Error fetching logged user:', error);
          this.router.navigate(['authentication']); // Redirect to authentication page
        });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  updateSizeOptions(): void {
    const selectedCategory = this.product.category;
    this.sizeList = this.sizeOptions[selectedCategory || ''] || [];
  }

  onCategoryChange(): void {
    this.updateSizeOptions();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.product.image_base64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    try {
      await this.productService.createProduct(this.product);
      // Show success alert
      window.alert('Produto publicado com sucesso!');

      // Redirect to products page
      this.router.navigate(['/products']);  // Navigate to the 'products' page
    } catch (error) {
      console.error('Error publishing product:', error);
    }
  }
}



