import { Injectable } from '@angular/core';
import { UserProfile } from './user-profile';
import { User } from './user';

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
    let url = `${this.baseUrl}users/profile/`;
    if (id != null) {
        url += `?user_id=${id}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }

  }
