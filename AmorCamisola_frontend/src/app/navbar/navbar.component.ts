import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { NavbarLoginComponent } from '../navbar-login/navbar-login.component';
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterModule, NavbarLoginComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  log_user: UserProfile | null = null;
  username: string = "";
  logged_in: boolean = false;
  moderator: boolean = false;
  wallet: number = 0;
  private subscription!: Subscription;

  userService: UserService = inject(UserService);
  loginService: LoginService = inject(LoginService);

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    if (this.isBrowser()) {
      this.initializeUser();
    } else {
      console.warn("localStorage não está disponível no ambiente atual.");
    }
    this.subscription = this.userService.walletValue$.subscribe((value) => {
      console.log('Wallet value changed:', value);
      this.wallet = value;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  async initializeUser(): Promise<void> {
    await this.loadLoggedUser(); // Wait for the user to load
    console.log(this.log_user); // Now this will have the correct value
  
    if (this.log_user != null) {
      this.wallet = this.log_user.wallet;
      console.log("login", this.logged_in);
      this.username = this.log_user.user.username;
      console.log(this.username);
      await this.loadModerator(); // Proceed only after log_user is set
    }
  }

  async loadLoggedUser(): Promise<void> {
    try {
      const user = await this.loginService.getLoggedUser();
      console.log("User loggado",user)
      this.log_user = user;
      this.logged_in = true;
    } catch (error) {
      console.error("Failed to load logged user:", error);
      this.logged_in = false;
    }
  }

  async loadModerator(): Promise<void> {
    try{
      this.userService
        .checkModerator(this.username)
        .then((fetchmoderator: boolean)=>{
          this.moderator = fetchmoderator
          console.log("moderator",fetchmoderator)
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
    }catch (error) {
      console.error("Failed to load logged user:", error);
      this.logged_in = false;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  logout() {
    this.loginService.logout();
    this.logged_in = false;
    this.log_user = null;
    this.router.navigate(['/']);
    window.location.reload(); // shouldn't be here but unfortunately if the page is already /products then poo poo
  }
}
