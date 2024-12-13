import { Component, OnInit, inject, Input } from '@angular/core';
import { UserService } from '../user.service';
import { UserProfile } from '../user-profile';
import { CommonModule } from '@angular/common';
import { UserComponent } from '../user/user.component';  
import { RouterModule } from '@angular/router';
import { User } from '../user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UserComponent], 
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Input() users: UserProfile[] = [];
  @Input() simple_user: User[] = [];
  @Input() perfil: boolean = false;
  isLoading: boolean = true;
  userService: UserService = inject(UserService);

  constructor() {}

  ngOnInit(): void {
    console.log("perfil", this.perfil)
    console.log("users",this.simple_user)
    console.log("lenght", this.simple_user.length)
    if (this.perfil && this.simple_user.length > 0) {
      this.userService.getUsersProfiles(this.simple_user)
        .then((users: UserProfile[]) => {
          this.users = users;
          console.log("Users fetched from service: ", users);
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Error fetching users:', error);
          this.isLoading = false;
        });
    }
    else if (!this.perfil && this.users.length === 0) {
      this.userService.getUsers()
        .then((users: UserProfile[]) => {
          this.users = users;
          console.log("Users fetched from service: ", users);
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Error fetching users:', error);
          this.isLoading = false;
        });
    } else {
      console.log("Users received from input: ", this.users);
      this.isLoading = false; // No need to fetch if users are already provided
    }
  }
}

