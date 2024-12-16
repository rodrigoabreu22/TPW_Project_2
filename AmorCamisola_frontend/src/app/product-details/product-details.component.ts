import { Component, Input, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserProfile } from '../user-profile';
import { UserService } from '../user.service';
import { LoginService } from '../login.service';
import { ReportView } from '../report-view';
import { ModeratorService } from '../moderator.service';
import { ReportListComponent } from '../report-list/report-list.component';
import { Report } from '../report';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule,ReportListComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  @Input() productId: number = 0;
  reports: Report[] = [];
  product: Product | null = null;
  sellerInfo: UserProfile | null = null;
  moderator: boolean =false;
  token: string | null = null;

  private productService: ProductService = inject(ProductService);
  private userService: UserService = inject(UserService);
  private loginService: LoginService = inject(LoginService);
  private moderatorService: ModeratorService = inject(ModeratorService);

  constructor(private route: ActivatedRoute) {
    this.productId = route.snapshot.params['id']
  }

  async ngOnInit(): Promise<void> {
    console.log("Product detail")
    if (this.productId <= 0) {
      console.warn('Invalid or missing product ID.');
      return;
    }

    try {
      // Fetch product details
      this.product = await this.productService.getProduct(this.productId);
      const user = await this.loginService.getLoggedUser();
      this.moderator = await this.userService.checkModerator(user.user.username);
      console.log("moderator1",this.moderator)
      if (this.moderator){
        console.log("entrei")
        if (this.isBrowser()) {
          this.token = localStorage.getItem("token");
          if(this.token){
            const fetchedReports = await this.moderatorService.getPReports(this.productId,this.token);
            this.reports = fetchedReports;
          }
        }
        else{
          console.warn("localStorage não está disponível no ambiente atual.");
        }
        console.log("Reports",this.reports)
      }
      // If the product has a seller, fetch seller info
      if (this.product.seller.username) {
        this.sellerInfo = await this.userService.getUser(this.product.seller.username);
      }
    } catch (error) {
      console.error('Error loading product or seller information:', error);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
