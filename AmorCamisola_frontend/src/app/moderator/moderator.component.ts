import { Component, inject } from '@angular/core';
import { ReportView } from '../report-view';
import { ModeratorService } from '../moderator.service';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-moderator',
  standalone: true,
  imports: [CommonModule,RouterModule,RouterLink],
  templateUrl: './moderator.component.html',
  styleUrl: './moderator.component.css'
})
export class ModeratorComponent {
  product_reports: ReportView[] = [];
  user_reports: ReportView[] = [];
  token: string | null = null;

  moderatorService: ModeratorService = inject(ModeratorService);

  constructor (){}

  ngOnInit(): void {
    if (this.isBrowser()) {
      this.token = localStorage.getItem("token");
      this.reports();
    }
    else{
      console.warn("localStorage não está disponível no ambiente atual.");
    }
  }

  showUserReports: boolean = true; // Default to showing user reports

  toggleSection(section: string): void {
    console.log(`Toggling to section: ${section}`);
    if (section === 'user') {
      this.showUserReports = true;
    } else if (section === 'product') {
      this.showUserReports = false;
    }
  }

  async reports(): Promise<void> {
    await this.loadUserReports();
    await this.loadProductReports();
    console.log(this.product_reports);
    console.log(this.user_reports)
  }

  async loadUserReports(): Promise<void> {
    try {
      if (this.token){
        const u_report = await this.moderatorService.getUserReports(this.token);
        this.user_reports = u_report
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  }

  async loadProductReports(): Promise<void> {
    try {
      if (this.token){
        const p_report = await this.moderatorService.getProductReports(this.token);
        this.product_reports = p_report
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

}
