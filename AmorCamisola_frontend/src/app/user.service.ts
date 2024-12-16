import { Injectable, inject } from '@angular/core';
import { UserProfile } from './user-profile';
import { User } from './user';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl :string = 'http://localhost:8080/ws/';

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
    let url = `${this.baseUrl}users`;
    if (id != null) {
        url += `/${id}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }

   async updateUserProfile(userProfile: UserProfile, password?: string, imageBase64?: string): Promise<any> {
    const id = userProfile.user.id;
    const url = `${this.baseUrl}users/${id}`;
    
    const payload: any = { ...userProfile, password };
    if (imageBase64) {
      payload.image_base64 = imageBase64;
    }
  
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to update profile. Status: ${response.status}`);
    }
  
    return response.json();
  }  

   async getUserFavorites(): Promise<Product[]>{
      const userId = localStorage.getItem('id');
      if (!userId) {
        throw new Error('User is not logged in.');
      }
      let url = `${this.baseUrl}users/${userId}/favorites`;
      const data :Response = await fetch(url);
      return await data.json() ?? undefined;
   }
  }
