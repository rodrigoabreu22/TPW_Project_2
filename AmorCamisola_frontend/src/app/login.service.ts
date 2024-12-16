import { inject, Injectable } from '@angular/core';
import { UserProfile } from './user-profile';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private baseUrl: string = 'http://localhost:8080/ws/';
  userService: UserService = inject(UserService);

  constructor() {}

    async getLoggedUser(): Promise<UserProfile> {
      const userId = localStorage.getItem('id');
      if (!userId) {
        throw new Error('User is not logged in.');
      }
      return this.userService.getUsersProfile(parseInt(userId, 10));
    }

  private setCurrentUser(user: UserProfile | null): void {
    console.log('Setting current user:', user);
    if (user) {
      localStorage.setItem('id', JSON.stringify(user?.id));
    }
  }

  async login(username: string, password: string): Promise<UserProfile | null> {
    const url: string = this.baseUrl + 'login';
    const data: Response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    let response: any;
    if (!data.ok) {
      response = await data.text();
      console.log('Error logging in:', response);
      return null;
    } else {
      response = await data.json();
      console.log('Login response:', response);
    }

    if (response.token) {
      localStorage.setItem('token', response.token);
      this.setCurrentUser(response.userProfile);
      return response;
    } else {
      console.error('Error: did not get token');
      this.setCurrentUser(response.userProfile);
      return response;
    }
  }

  async register(userProfile: UserProfile, password: string): Promise<UserProfile | null> {
    const url: string = this.baseUrl + 'register';
    const data: Response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userProfile: userProfile,
        password: password,
      }),
    });

    let response: any;
    if (!data.ok) {
      response = await data.text();
      console.error('Error registering:', response);
      return null;
    } else {
      response = await data.json();
      console.log('Registration response:', response);
      this.setCurrentUser(response);
      return response;
    }
  }

  /**
   * Clear the user's session / logout
   */
  logout() {
    if (localStorage.getItem('token') === null) {
      localStorage.removeItem('token');
    }
    if (localStorage.getItem('id') === null) {
      localStorage.removeItem('id');
    }
    this.setCurrentUser(null);
  }
}
