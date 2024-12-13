import { Component, Input, inject, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { UserProfile } from '../user-profile';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @Input() username: string = "";
  @Input() perfil: boolean = false;

  user: UserProfile | null = null;

  userService: UserService = inject(UserService);

  constructor() {}

  ngOnInit(): void {
    if (this.username != "") {
      console.log("Username  ", this.username)
      this.userService
        .getUser(this.username)
        .then((fetchedUser: UserProfile) => {
          this.user = fetchedUser;
          console.log(this.user)
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
    } else {
      console.warn('Invalid or missing user ID.');
    }
  }
}
