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
    let response: any;
    if (!data.ok) {
      response = await data.text();
      console.log('Error logging in:', response);
      return false;
    }
    else {
      response = await data.json();
      console.log('Login response:', response);
    }
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('id', response.user.id);
      localStorage.setItem('username',response.user.username);
      return true;
    } else {
      localStorage.setItem('id', response.user.id);
      localStorage.setItem('username',response.user.username);
      return true;
    }
  }
}