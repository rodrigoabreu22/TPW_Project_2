import {Component, inject, Input} from '@angular/core';
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

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule,ProductListComponent, UserListComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})

export class UserProfileComponent {
  username: string = "";
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
  pnumber: number = 0;
  products: Product[] = [];
  seguidores: User[] = [];
  seguindo: User[] = [];
  follow: Following = {
    followed: [],
    following: []
  };
  load: boolean = true;

  productService: ProductService = inject(ProductService)
  userService: UserService = inject(UserService);
  followService: FollowerInfoService = inject(FollowerInfoService);

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username') || "";
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
  
}