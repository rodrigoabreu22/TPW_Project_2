import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  userProfile: UserProfile | null = {
    id: 0,
    user: {
      id: 0,
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      is_active: true,
    },
    address: '',
    phone: '',
    wallet: 0,
    image: '',
  };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;
  newPassword: string = '';
  confirmPassword: string = '';
  imageBase64: string | null = null; // To store the Base64 image string

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

    // Ensure passwords match, if provided
    if (this.newPassword || this.confirmPassword) {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }
    }

    try {
      this.isLoading = true;
      const response = await this.userService.updateUserProfile(this.userProfile, this.newPassword, this.imageBase64 || undefined);
      if (response) {
        this.successMessage = 'Profile updated successfully!';
        await this.loadUserProfile();
        this.newPassword = ''; // Clear password fields
        this.confirmPassword = '';
        this.imageBase64 = null; // Clear the imageBase64 after successful update
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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string; // Convert file to Base64 string
      };
      reader.readAsDataURL(file);
    }
  }

  private resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
