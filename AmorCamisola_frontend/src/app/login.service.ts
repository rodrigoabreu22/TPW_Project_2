import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl: string = "http://localhost:8080/ws/";

  constructor() { }

  async login(username: string, password: string): Promise<boolean> {
    const url: string = this.baseUrl + "login";
    const data: Response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    
    const response: any = await data.json();
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('id', response.user.id);
      return true;
    } else {
      return false;
    }
  }
}