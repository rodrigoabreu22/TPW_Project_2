import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { NavbarLoginComponent } from '../navbar-login/navbar-login.component';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterModule, NavbarLoginComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  username: string = "";
  logged_in: boolean = false;
  moderator: boolean = false;

  userService: UserService = inject(UserService);

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.isBrowser()) {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername !== null && storedUsername !== "") {
        this.username = storedUsername;
        this.logged_in = true;
      }
    } else {
      console.warn("localStorage não está disponível no ambiente atual.");
    }
    console.log("login",this.logged_in)
    if (this.logged_in){
      this.userService
        .checkModerator(this.username)
        .then((fetchmoderator: boolean)=>{
          this.moderator = fetchmoderator
          console.log("moderator",fetchmoderator)
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
