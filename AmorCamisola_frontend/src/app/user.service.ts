import { Injectable, inject } from '@angular/core';
import { UserProfile } from './user-profile';
import { User } from './user';
import { Product } from './product';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl :string = 'http://localhost:8080/ws/';


  loginService: LoginService = inject(LoginService);
  constructor() {

   }

   async getUser(username: string): Promise<UserProfile> {
    let url = `${this.baseUrl}users/`;
    if (username != null) {
        url += `?username=${username}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }
   async getUsers(): Promise<UserProfile[]> {
    let url = `${this.baseUrl}users/`;
    const data: Response = await fetch(url);
    return await data.json() ?? [];
  }
  async getUsersProfiles(users: User[]): Promise<UserProfile[]> {
    console.log("Users array:", users);
    const usernames = users.map(user => user.username); // Get the usernames from the users array
    const url = `${this.baseUrl}usersprofiles/?usernames=${encodeURIComponent(usernames.join(','))}`;
    console.log("usernames",usernames)
    const response: Response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching user profiles: ${response.statusText}`);
    }

    return await response.json();
  }
  async checkModerator(username: string): Promise<boolean> {
    let url = `${this.baseUrl}moderator`;
    if (username != null){
      url += `?username=${username}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
  }
  

   async getUsersProfile(id: number): Promise<UserProfile> {
    let url = `${this.baseUrl}users/profile/`;
    if (id != null) {
        url += `?user_id=${id}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }

   async getUserFavorites(): Promise<Product[]>{
      //const userId = this.loginService.getLoggedUserId();
      //if (!userId) {
      //  throw new Error('User is not logged in.');
      //}
      //ws/users/<int:user_id>/favorites/
      //let url = `${this.baseUrl}users/${userId}/favorites`;
      let url = `${this.baseUrl}users/1/favorites`;
      const data :Response = await fetch(url);
      return await data.json() ?? undefined;
   }

  }
