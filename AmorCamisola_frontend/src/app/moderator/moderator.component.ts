import { Component, inject } from '@angular/core';
import { ReportView } from '../report-view';
import { ModeratorService } from '../moderator.service';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';
import { LoginService } from '../login.service';
import { UserService } from '../user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-moderator',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './moderator.component.html',
  styleUrl: './moderator.component.css'
})
export class ModeratorComponent {
  product_reports: ReportView[] = [];
  user_reports: ReportView[] = [];
  token: string | null = null;

  moderatorService: ModeratorService = inject(ModeratorService);
  loginService: LoginService = inject(LoginService);
  userService: UserService = inject(UserService);

  constructor (private router: Router){}

  ngOnInit(): void {
    if (this.isBrowser()) {
      this.token = localStorage.getItem("token");
      this.process();
      this.reports();
    }
    else{
      console.warn("localStorage não está disponível no ambiente atual.");
    }
  }
  async process(): Promise<void> {
    this.loginService.getLoggedUser()
            .then(user => {
              if (user) {
                this.userService.checkModerator(user.user.username)
                .then(moderator => {
                  if (!moderator){
                    this.router.navigate(['/']);
                  }
                })
                .catch(error => {
                  console.error('Error fetching logged user:', error);
                  this.router.navigate(['/']); // Redirect to authentication page
                });
                console.log("USER ATUAL", user);
              }
            })
            .catch(error => {
              console.error('Error fetching logged user:', error);
              this.router.navigate(['/']); // Redirect to authentication page
            });
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

  async deleteProduct(productId: any): Promise<void> {
    try {
      if (this.token) {
        await this.moderatorService.deleteProduct(productId, this.token);
        // Remove the deleted product from the product_reports array
        this.product_reports = this.product_reports.filter(
          report => report.report.product?.id !== productId
        );
        console.log(`Product with ID ${productId} deleted successfully.`);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }

  async toggleUserBan(userId?: number, isActive?: boolean): Promise<void> {
    if (userId === undefined || isActive === undefined) {
      console.error('Invalid user ID or status.');
      return;
    }
  
    try {
      const action = isActive ? 'ban' : 'unban';
      await this.moderatorService.toggleBanUser(userId, isActive, this.token!);
      console.log(`User ${userId} ${action}ned successfully.`);
      this.user_reports = this.user_reports.map(report => {
        if (report.report.reporting?.user?.id === userId) {
          report.report.reporting.user.is_active = !isActive;
        }
        return report;
      });
    } catch (error) {
      console.error(`Failed to ${isActive ? 'ban' : 'unban'} user:`, error);
    }
  }
  
  async closeReport(reportId: number, user: boolean): Promise<void> {
    try {
      await this.moderatorService.closeReport(reportId, this.token!);
      console.log(`Report ${reportId} closed successfully.`);
      if (user){
        this.user_reports = this.user_reports.filter(report => report.report.id !== reportId);
      }
      else{
        this.product_reports = this.product_reports.filter(report => report.report.id !== reportId);
      }
    } catch (error) {
      console.error('Failed to close report:', error);
    }
  }
  


  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

}
