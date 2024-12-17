import { Component, inject, Input, ViewChild } from '@angular/core';
import { ProductService } from "../product.service";
import { User } from "../user";
import { UserService } from '../user.service';
import { FollowerInfoService } from '../follower-info.service';
import { UserProfile } from "../user-profile";
import { Product } from "../product";
import { CommonModule } from "@angular/common";
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
  imports: [CommonModule, RouterModule, ProductListComponent, UserListComponent, ReportListComponent, ReportModalComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  @ViewChild(ReportModalComponent) reportModal: ReportModalComponent | undefined;

  log_user: UserProfile | null = null; // Logged-in user
  username: string = "";
  log_username: string = "";
  logged_in: boolean = false; // Indicates if a user is logged in
  userprofile: UserProfile = {
    id: 0,
    user: {} as User,
    address: '',
    phone: '',
    wallet: 0,
    image: '',
  };

  followers_number: number = 0;
  following_number: number = 0;
  myprofile: boolean = false; // Determines if the current profile belongs to the logged user
  pnumber: number = 0;
  products: Product[] = [];
  followers: User[] = [];
  following: User[] = [];
  load: boolean = true;
  moderator: boolean = true;
  reports: Report[] = [];
  token: string | null = null;
  isFollowing: boolean = false;

  productService: ProductService = inject(ProductService);
  userService: UserService = inject(UserService);
  followService: FollowerInfoService = inject(FollowerInfoService);
  loginService: LoginService = inject(LoginService);
  moderatorService: ModeratorService = inject(ModeratorService);

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username') || "";
    if (this.isBrowser()) {
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
    this.load = true;
    try {
      // Always load the profile data, even if the user is not logged in
      if (this.username) {
        this.userprofile = await this.userService.getUser(this.username);
  
        // Default is_active to true if undefined
        if (this.userprofile.user && this.userprofile.user.is_active === undefined) {
          this.userprofile.user.is_active = true;
        }
  
        // Load products
        const fetchedProducts = await this.productService.getProductsByUsername(this.username);
        this.products = fetchedProducts;
        this.pnumber = fetchedProducts.length;
  
        // Additional checks only if user is logged in
        await this.loadLoggedUser();
        if (this.logged_in && this.log_user) {
          this.log_username = this.log_user.user.username;
          if (this.username === this.log_username) {
            this.myprofile = true;
          }
  
          if (this.userprofile.user.id) {
            const followers = await this.followService.getFollowers(this.userprofile.user.id);
            this.followers_number = followers.length;
            this.followers = followers;
  
            const following = await this.followService.getFollows(this.userprofile.user.id);
            this.following = following;
            this.following_number = following.length;
  
            // Check if the logged-in user follows this profile
            this.isFollowing = this.followers.some(f => f.username === this.log_username);
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      this.load = false;
    }
  }
  

  async loadLoggedUser(): Promise<void> {
    try {
      const user = await this.loginService.getLoggedUser();
      this.log_user = user;
      this.logged_in = true;
    } catch (error) {
      console.warn("No user is logged in.");
      this.logged_in = false;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  async followUser(): Promise<void> {
    if (!this.logged_in) return;

    const followData: Following = {
      following: this.log_user!.user,
      followed: this.userprofile.user,
    };

    try {
      await this.followService.addFollow(followData);
      this.isFollowing = true;
      this.followers_number += 1;
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  async unfollowUser(): Promise<void> {
    if (!this.logged_in) return;

    const followData: Following = {
      following: this.log_user!.user,
      followed: this.userprofile.user,
    };

    try {
      await this.followService.removeFollow(followData);
      this.isFollowing = false;
      this.followers_number -= 1;
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  }
}
