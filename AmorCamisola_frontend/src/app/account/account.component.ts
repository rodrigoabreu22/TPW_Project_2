import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true, // <-- This makes it a standalone component
  imports: [CommonModule, FormsModule], // Import CommonModule and FormsModule
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  userProfile: UserProfile | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private userService: UserService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  async loadUserProfile(): Promise<void> {
    this.resetMessages();
    try {
      this.isLoading = true;
      this.userProfile = await this.loginService.getLoggedUser();
      if (!this.userProfile) {
        this.errorMessage = 'No user profile found.';
      }
    } catch (error) {
      this.errorMessage = 'Failed to load user profile.';
      console.error('Load Error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async updateProfile(): Promise<void> {
    this.resetMessages();
    if (!this.userProfile) {
      this.errorMessage = 'Cannot update an empty profile.';
      return;
    }
    try {
      this.isLoading = true;
      const response = await this.userService.updateUserProfile(this.userProfile);
      if (response) {
        this.successMessage = 'Profile updated successfully!';
        await this.loadUserProfile();
      } else {
        this.errorMessage = 'Failed to update profile. Please try again.';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred while updating the profile.';
      console.error('Update Error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async updatePassword(): Promise<void> {
    this.resetMessages();
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    try {
      const response = await this.userService.updateUserPassword(this.newPassword);
      if (response) {
        this.successMessage = 'Password updated successfully!';
      } else {
        this.errorMessage = 'Failed to update password.';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred while updating the password.';
      console.error('Password Update Error:', error);
    }
  }

  private resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
