import { Component, Input, inject, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserProfile } from '../user-profile';
import { UserService } from '../user.service';
import { LoginService } from '../login.service';
import { ReportView } from '../report-view';
import { ModeratorService } from '../moderator.service';
import { ReportListComponent } from '../report-list/report-list.component';
import { Report } from '../report';
import { ReportModalComponent } from '../report-modal/report-modal.component';
import { OfferModalComponent } from '../offer-modal/offer-modal.component';
import { Offer } from '../offer';
import { OffersService } from '../offers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule,ReportListComponent, ReportModalComponent, OfferModalComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  @Input() productId: number = 0;
  reports: Report[] = [];
  product: Product | null = null;
  sellerInfo: UserProfile | null = null;
  moderator: boolean =false;
  token: string | null = localStorage.getItem("token") || null;
  showModal: boolean = false; // Controls modal visibility
  offerService: OffersService = inject(OffersService);
  showReports = false;
  log_user: UserProfile | null = null;
  offerSubscription!: Subscription;

  toggleReports() {
    this.showReports = !this.showReports;
  }

  //offer modal things
  buyer: UserProfile | null = null;
  

  private productService: ProductService = inject(ProductService);
  private userService: UserService = inject(UserService);
  private loginService: LoginService = inject(LoginService);
  private moderatorService: ModeratorService = inject(ModeratorService);

  private currentNegotiations: Offer[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.productId = route.snapshot.params['id']
    const userId = Number(localStorage.getItem("id"));
    if (this.token) {
      this.offerService.getOffersByUser(userId, this.token).then(offers => {
        if (offers) {
          console.log('Offers:', offers);
          this.currentNegotiations = offers[0].concat(offers[1]).concat(offers[2]);
          console.log('Current negotiations:', this.currentNegotiations);
        } else {
          console.warn('No offers found');
        }
      }).catch(error => {
        console.error('Error fetching offers:', error);
      });
    } else {
      console.warn('Token is null');
    }
  }

  getOfferLabel(): string {
    if (!this.token) return "Iniciar sessão"
    if (this.currentNegotiations.some(offer => offer.product.id === this.product?.id)) return "Negociação em andamento";
    if (this.product?.seller.id === this.log_user?.user.id) return "Remover produto";
    if (!this.product?.is_active) return "Produto indisponível";
    
    return "Fazer proposta";
  }

  getOfferDisabled(): boolean {
    return !this.product?.is_active!;
  }

  getOfferColor(): string {
    if (!this.token) return "btn-primary";
    if (this.currentNegotiations.some(offer => offer.product.id === this.product?.id)) return "btn-warning";
    if (this.product?.seller.id === this.log_user?.user.id) return "btn-danger";
    if (!this.product?.is_active) return "btn-danger";
    return "btn-primary";
  }

  getOfferAction(): () => void {
    if (!this.token) return this.redirectToLogin;
    if (this.product?.seller.id === this.log_user?.user.id) return this.removeProduct;
    if (this.currentNegotiations.some(offer => offer.product.id === this.product?.id)) return this.redirectToOffers;
    if (this.product?.seller.id === this.log_user?.user.id) return this.removeProduct;
    return this.showOfferModal;
  }

  onReportSubmitted(): void {
    console.log('Report was successfully submitted!');
    this.fetchReports();
    // Perform any additional actions, e.g., refresh user profile or show a success message
    alert('Thank you for your report!');
  }

  async ngOnInit(): Promise<void> {
    console.log("Product detail")
    this.offerSubscription = this.offerService.currentOffers$.subscribe((value) => {
      console.log('Offer value changed:', value);
      this.currentNegotiations = value![0].concat(value![1]).concat(value![2]);
    });
    if (this.productId <= 0) {
      console.warn('Invalid or missing product ID.');
      return;
    }

    try {
      // Fetch product details
      this.product = await this.productService.getProduct(this.productId);
      const user = await this.loginService.getLoggedUser();
      this.log_user = user;
      this.moderator = await this.userService.checkModerator(user.user.username);
      if (this.moderator){
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
      }
      // If the product has a seller, fetch seller info
    } catch (error) {
      console.error('Error loading product or seller information:', error);
    }
    if (this.product) {
      this.sellerInfo = await this.userService.getUser(this.product.seller.username);
    }
  }

  async fetchReports(): Promise<void> {
    if (this.moderator){
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
    }
  }

  removeProduct = async () => {
    console.log('removeProduct');
    this.productService.deleteProduct(this.productId, this.token!);
    this.router.navigate(["/"])
  };

  redirectToOffers = (): void => {
    console.log('redirectToOffers');
    this.router.navigate(['offers']);
  };

  redirectToLogin = (): void => {
    console.log('redirectToLogin');
    this.router.navigate(['authentication']);
  }
  

  submitOffer(offer: Offer) {
    this.offerService.submitOffer(offer, this.token!);

    console.log('submitOffer', offer);
    this.showModal = false;
  }

  showOfferModal = async () => {
    this.buyer = await this.loginService.getLoggedUser();
    this.showModal = true;
  };
  

  onModalClick(event: Event){
    event.stopPropagation();
  }

  closeOfferModal(){
    this.showModal = false;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
