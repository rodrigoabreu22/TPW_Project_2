import { Component, Input, Output, EventEmitter, inject, ViewChild, ElementRef } from '@angular/core';
import { Report } from '../report';
import { ModeratorService } from '../moderator.service';
import { LoginService } from '../login.service';
import { log } from 'console';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../user-profile';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent {
  @Input() user: boolean = true; // True if reporting a user, false for a product
  @Input() target: any; // User or Product being reported
  @Output() reportSubmitted = new EventEmitter<void>();

  reasons = [
    { code: 'IN', label: 'Conteúdo Inapropriado' },
    { code: 'FR', label: 'Fraude' },
    { code: 'OT', label: 'Outro' },
  ];

  report: Partial<Report> = {
    reasons: 'IN',
    description: '',
    product: null,
    reporting: null,
    sent_by: null,
  };

  token: string | null = null;
  currentUser: any | null = null;

  loginService: LoginService = inject(LoginService);


  constructor(private reportService: ModeratorService) {}

  ngOnInit(): void {
    if (this.isBrowser()){
      this.process();
    } else {
      console.warn("localStorage não está disponível no ambiente atual.");
    }
  }
  async process(): Promise<void> {
    this.token = localStorage.getItem("token");
    const log_user = await this.loginService.getLoggedUser();
    if (log_user){
      this.currentUser = log_user
      this.report.sent_by = this.currentUser
    }
    if (this.user && this.token) {
      this.report.reporting = this.target as UserProfile; // Assign user to be reported
    } else {
      this.report.product = this.target; // Assign product to be reported
    }
  }

  onReasonChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.report.reasons = selectElement.value;
  }

  onDescriptionChange(event: Event): void {
    const textareaElement = event.target as HTMLTextAreaElement;
    this.report.description = textareaElement.value;
  }

  submitReport(): void {
    // Validate the report before submission
    if (!this.report.reasons || !this.report.description) {
      alert('Please fill out all required fields.');
      return;
    }
    if (this.token) {
      this.reportService.createReport(this.report as Report, this.token).then(
        () => {
          this.reportSubmitted.emit(); // Notify the parent component
          this.resetForm(); // Reset form after successful submission
        },
        (error) => {
          console.error('Error submitting report:', error);
          this.resetForm();
          alert('Failed to submit report. Please try again later.');
        }
      );
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private resetForm(): void {
    this.report.reasons = '';
    this.report.description = '';
    this.report.product = null;
    this.report.reporting = null;

    // Reassign the target for subsequent submissions
    if (this.user) {
      this.report.reporting = this.target;
    } else {
      this.report.product = this.target;
    }
  }
}
