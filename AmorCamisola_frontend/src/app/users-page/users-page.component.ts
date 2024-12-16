import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../user.service';
import { UserProfile } from '../user-profile';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserListComponent } from '../user-list/user-list.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UserListComponent],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css'],
})
export class UsersPageComponent implements OnInit {
  users: UserProfile[] = [];
  filteredUsers: UserProfile[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;
  userService: UserService = inject(UserService);

  constructor() {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  // Fetch users on initialization
  private fetchUsers(): void {
    this.userService.getUsers()
      .then((users: UserProfile[]) => {
        this.users = users;
        this.filteredUsers = users; // Initially, show all users
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        this.isLoading = false;
      });
  }

  // Update filtered users based on search input
  onSearchChange(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = query
      ? this.users.filter(user =>
          user.user.username.toLowerCase().includes(query)
        )
      : this.users; // Reset to all users if search is cleared
  }
}
