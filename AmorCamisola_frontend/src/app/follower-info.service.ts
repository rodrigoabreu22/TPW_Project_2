import { Injectable } from '@angular/core';
import { UserProfile } from './user-profile';
import { Following } from './following';

@Injectable({
  providedIn: 'root'
})
export class FollowerInfoService {
  private baseUrl :string = 'http://localhost:8080/ws/';
  constructor() { }

  async getFollowers(username: string): Promise<Following> {
    console.log(username)
    let url = `${this.baseUrl}follows/`;
    if (username != null) {
        url += `?username=${username}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }
}
