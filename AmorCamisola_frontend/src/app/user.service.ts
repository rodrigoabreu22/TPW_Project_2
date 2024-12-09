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

   async getUsersProfile(id: number): Promise<UserProfile> {
    let url = `${this.baseUrl}users/profile/`;
    if (id != null) {
        url += `?user_id=${id}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }

  }
