import {Component, inject, Input, ViewChild} from '@angular/core';
import {ProductService} from "../product.service";
import {User} from "../user";
import { UserService } from '../user.service';
import { FollowerInfoService } from '../follower-info.service';
import {UserProfile} from "../user-profile";
import {Product} from "../product";
import {CommonModule} from "@angular/common";
import {RouterLink} from "@angular/router";
import {ProductComponent} from "../product/product.component";
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Following } from '../following';
import { ProductListComponent } from '../product-list/product-list.component';
import { UserListComponent } from '../user-list/user-list.component';
import { LoginService } from '../login.service';
import { Report } from '../report';
import { ModeratorService } from '../moderator.service';
import { ReportListComponent } from '../report-list/report-list.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule,ProductListComponent, UserListComponent, ReportListComponent, ReportModalComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})

export class UserProfileComponent {
  @ViewChild(ReportModalComponent) reportModal: ReportModalComponent | undefined;

  log_user: UserProfile | null = null;
  username: string = "";
  log_username: string = "";
  logged_in: boolean = false;
  userprofile: UserProfile = {
    id : 0,
    user: {} as User,
    address: '',
    phone: '',
    wallet: 0,
    image: '',
  };
  
  followers: number = 0;
  following: number = 0;
  myprofile: boolean = false;
  pnumber: number = 0;
  products: Product[] = [];
  seguidores: User[] = [];
  seguindo: User[] = [];
  follow: Following = {
    followed: [],
    following: []
  };
  load: boolean = true;
  moderator: boolean = true;
  reports: Report[] = [];
  token: string | null = null;

  productService: ProductService = inject(ProductService)
  userService: UserService = inject(UserService);
  followService: FollowerInfoService = inject(FollowerInfoService);
  loginService: LoginService = inject(LoginService);
  moderatorService: ModeratorService = inject(ModeratorService);

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username') || "";
    console.log("profile user",this.username)
    if (this.isBrowser()){
      this.process();
    } else {
      console.warn("localStorage não está disponível no ambiente atual.");
    }
    
  }

  onReportSubmitted(): void {
    console.log('Report was successfully submitted!');
    this.process();
    // Perform any additional actions, e.g., refresh user profile or show a success message
    alert('Thank you for your report!');
  }

  async process(): Promise<void> {
    await this.loadLoggedUser();
    const user = await this.loginService.getLoggedUser();
    this.moderator = await this.userService.checkModerator(user.user.username);
    console.log("moderator1",this.moderator)
    if (this.moderator){
      console.log("entrei")
      if (this.isBrowser()) {
        this.token = localStorage.getItem("token");
        if(this.token){
          console.log("USERNAME RAG",this.username)
          const fetchedReports = await this.moderatorService.getUReports(this.username,this.token);
          this.reports = fetchedReports;
        }
      }
      else{
        console.warn("localStorage não está disponível no ambiente atual.");
      }
    }
    console.log("USER REPORTS",this.reports)
    console.log("useruser",this.log_user)
      if (this.logged_in && this.log_user !=null){
        this.log_username = this.log_user.user.username;
        if (this.username === this.log_username) {
          console.log("Banana");
          this.myprofile = true
        }
      }
    if (this.username != "") {
      console.log("Username  ", this.username)
      this.userService
        .getUser(this.username)
        .then((fetchedUser: UserProfile) => {
          this.userprofile = fetchedUser;
          console.log(this.userprofile)
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });

      this.productService
        .getProductsByUsername(this.username)
        .then((fetchedProducts: Product[]) => {
          this.products = fetchedProducts;
          this.pnumber = fetchedProducts.length
          console.log(this.products)
        })
        .catch((error) => {
          console.error('Error fetching products from user:', error);
        });

        this.followService
        .getFollowers(this.username)
        .then((fetchedFollow: Following) => {
          this.follow = fetchedFollow;
          console.log("follow",this.follow)
          this.followers = fetchedFollow.followed.length;
          this.seguidores = fetchedFollow.followed
          this.seguindo = fetchedFollow.following
          this.following = fetchedFollow.following.length;
        })
        .catch((error) => {
          console.error('Error fetching products from user:', error);
        });
    } else {
      console.warn('Invalid or missing user ID.');
    }
  }

  async loadLoggedUser(): Promise<void> {
    try {
      const user = await this.loginService.getLoggedUser();
      console.log("User loggado",user)
      this.log_user = user;
      console.log("useruser",this.log_user)
      this.logged_in = true;
    } catch (error) {
      console.error("Failed to load logged user:", error);
      this.logged_in = false;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  
}