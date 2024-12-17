import { Injectable } from '@angular/core';
import { Following } from './following';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class FollowerInfoService {
  private baseUrl :string = 'http://localhost:8080/ws/';
  constructor() { }

  async getFollowers(userId: number): Promise<User[]> {
    let url = `${this.baseUrl}followers/${userId}`;
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }

   async getFollows(userId: number): Promise<User[]> {
    let url = `${this.baseUrl}follows/`;
    if (userId != null) {
        url += `?userId=${userId}`;
    }
    const data :Response = await fetch(url);
    return await data.json() ?? undefined;
   }

  async addFollow(follow: Following): Promise<any> {
   let url = `${this.baseUrl}follows/`;

   const payload={
    'following':follow.following.id,
    'followed':follow.followed.id
   }

   const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile. Status: ${response.status}`);
  }

  return response.json();
  }


  async removeFollow(follow: Following): Promise<any> {
    let url = `${this.baseUrl}follows/`;

    const payload={
      'following':follow.following.id,
      'followed':follow.followed.id
     }
 
    const response = await fetch(url, {
     method: 'DELETE',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(payload),
   });
 
   if (!response.ok) {
     throw new Error(`Failed to update profile. Status: ${response.status}`);
   }
 
   return response.json();
   }
}
