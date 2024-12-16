import { Injectable } from '@angular/core';
import { ReportView } from './report-view';
import { Report } from './report';

@Injectable({
  providedIn: 'root'
})
export class ModeratorService {

  private baseUrl: string = 'http://localhost:8080/ws/';

  constructor() { }

  async getProductReports(token: string): Promise<ReportView[]> {
    console.log("token: ",token)  
    const url = `${this.baseUrl}product-reports`;
    console.log("user url: ",url)
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return await response.json();
  }

  async getPReports(pId:number,token: string): Promise<Report[]> {
    console.log("token: ",token)  
    let url = `${this.baseUrl}product-reports/`;
    console.log("user url: ",url)
    if (pId !== null) {
      url += `?pid=${pId}`;
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return await response.json();
  }

  async getUserReports(token: string): Promise<ReportView[]> {
    console.log("token: ",token)  
    const url = `${this.baseUrl}user-reports`;
    console.log("user url: ",url)
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return await response.json();
  }

  async getUReports(username:string,token: string): Promise<Report[]> {
    console.log("token: ",token)  
    let url = `${this.baseUrl}user-reports/`;
    console.log("user url: ",url)
    if (username !== null && username!=="") {
      url += `?username=${username}`;
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return await response.json();
  }

  async deleteProduct(productId: number, token: string): Promise<void> {
    const url = `${this.baseUrl}products/${productId}/delete`; // Adjust the endpoint as per your backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
  
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }
  }

  async toggleBanUser(userId: number, isActive: boolean, token: string): Promise<void> {
    const url = `${this.baseUrl}users/${userId}/toggle-ban/`;  // Use '/toggle-ban/' instead of '/ban'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to ${isActive ? 'ban' : 'unban'} user: ${response.statusText}`);
    }
  }
  
  async closeReport(reportId: number, token: string): Promise<void> {
    const url = `${this.baseUrl}reports/${reportId}/close/`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to close report: ${response.statusText}`);
    }
  }
}
