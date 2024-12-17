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
    if (this.currentNegotiations.some(offer => offer.product.id === this.product?.id)) return "Negociação em andamento";
    if (this.product?.seller.id === Number(localStorage.getItem("id"))) return "Remover produto";
    if (!this.product?.is_active) return "Produto indisponível";
    
    return "Fazer proposta";
  }

  getOfferDisabled(): boolean {
    return !this.product?.is_active!;
  }

  getOfferColor(): string {
    if (this.currentNegotiations.some(offer => offer.product.id === this.product?.id)) return "btn-warning";
    if (this.product?.seller.id === Number(localStorage.getItem("id"))) return "btn-danger";
    if (!this.product?.is_active) return "btn-danger";
    return "btn-primary";
  }

  getOfferAction(): () => void {
    if (this.product?.seller.id === Number(localStorage.getItem("id"))) return this.removeProduct;
    if (this.currentNegotiations.some(offer => offer.product.id === this.product?.id)) return this.redirectToOffers;
    return this.showOfferModal;
  }

  onReportSubmitted(): void {
    console.log('Report was successfully submitted!');
    // Perform any additional actions, e.g., refresh user profile or show a success message
    alert('Thank you for your report!');
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

  removeProduct(): void {
    console.log('removeProduct');
    this.productService.deleteProduct(this.productId, this.token!);
  }

  redirectToOffers = (): void => {
    console.log('redirectToOffers');
    this.router.navigate(['offers']);
  };
  

  submitOffer(offer: Offer) {
    this.offerService.submitOffer(offer, this.token!);

    console.log('submitOffer', offer);
    this.showModal = false;
  }

  async showOfferModal(){
    this.buyer = await this.loginService.getLoggedUser();
    this.showModal = true;
  }

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
