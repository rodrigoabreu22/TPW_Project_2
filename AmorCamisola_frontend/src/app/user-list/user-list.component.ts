import { Component, OnInit, inject, Input } from '@angular/core';
import { UserService } from '../user.service';
import { UserProfile } from '../user-profile';
import { CommonModule } from '@angular/common';
import { UserComponent } from '../user/user.component';  
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UserComponent], 
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Input() userId: number = 0;
  users: UserProfile[] = [];
  isLoading: boolean = true;
  userService: UserService = inject(UserService);

  constructor() {}

  ngOnInit(): void {
    this.userService.getUsers()
      .then((users: UserProfile[]) => {
        this.users = users;
        console.log("Users: ",users)
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        this.isLoading = false;
      });
  }
}

