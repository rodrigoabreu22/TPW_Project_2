import {Component, inject, Input} from '@angular/core';
import {ProductService} from "../product.service";
import {User} from "../user";
import { UserService } from '../user.service';
import { FollowerInfoService } from '../follower-info.service';
import {UserProfile} from "../user-profile";
import {Product} from "../product";
import {CommonModule} from "@angular/common";
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Following } from '../following';
import { ProductListComponent } from '../product-list/product-list.component';
import { UserListComponent } from '../user-list/user-list.component';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule,ProductListComponent, UserListComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})

export class UserProfileComponent {
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
  
  followers_number: number = 0;
  following_number: number = 0;
  myprofile: boolean = false;
  pnumber: number = 0;
  products: Product[] = [];
  followers: User[] = [];
  following: User[] = [];
  load: boolean = true;
  isFollowing: boolean = false;


  productService: ProductService = inject(ProductService)
  userService: UserService = inject(UserService);
  followService: FollowerInfoService = inject(FollowerInfoService);
  loginService: LoginService = inject(LoginService);

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

  async process(): Promise<void> {
    await this.loadLoggedUser();
    console.log("user", this.log_user);
  
    if (this.logged_in && this.log_user != null) {
      this.log_username = this.log_user.user.username;
      if (this.username === this.log_username) {
        this.myprofile = true; // Está no próprio perfil
      }
    }
  
    if (this.username != "") {
      try {
        // Carregar perfil do usuário
        this.userprofile = await this.userService.getUser(this.username);
  
        // Carregar produtos do usuário
        const fetchedProducts = await this.productService.getProductsByUsername(this.username);
        this.products = fetchedProducts;
        this.pnumber = fetchedProducts.length;
  
        if (this.userprofile.user.id !== undefined) {
          this.followService
            .getFollowers(this.userprofile.user.id)
            .then((fetchedFollowers: User[]) => {
              this.followers_number = fetchedFollowers.length;
              this.followers = fetchedFollowers;
              
            })
            .catch((error) => {
              console.error("Error fetching followers", error);
            });
  
            this.followService
              .getFollows(this.userprofile.user.id)
              .then((fetchedFollowing: User[]) => {
                this.following = fetchedFollowing;
                this.following_number = fetchedFollowing.length;
                console.log("following: ", this.following)
              })
              .catch((error) => {
                console.error("Error fetching followings", error);
              });
            } else {
              console.warn("Logged user ID is undefined.");}
        this.isFollowing = this.followers.some(f => f.username === this.log_username);
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      }
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

  async followUser(): Promise<void> {
    const followData: Following = {
      following: this.log_user!.user,
      followed: this.userprofile.user,
    };
  
    try {
      await this.followService.addFollow(followData);
      this.isFollowing = true;
      this.followers_number += 1;
    } catch (error) {
      console.error("Erro ao seguir o usuário:", error);
    }
  }
  
  async unfollowUser(): Promise<void> {
    const followData: Following = {
      following: this.log_user!.user,
      followed: this.userprofile.user,
    };
  
    try {
      await this.followService.removeFollow(followData);
      this.isFollowing = false;
      this.followers_number -= 1;
    } catch (error) {
      console.error("Erro ao deixar de seguir o usuário:", error);
    }
  }
  
}