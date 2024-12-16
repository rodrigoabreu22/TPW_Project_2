import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportComponent } from '../report/report.component';
import { Report } from '../report';

@Component({
  selector: 'app-report-list',
  imports: [CommonModule,RouterModule,ReportComponent],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.css'
})
export class ReportListComponent {
  @Input() reports: Report[] = [];
  constructor(){}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reports']) {
      console.log("Updated reports:", this.reports);
    }
  }
}
