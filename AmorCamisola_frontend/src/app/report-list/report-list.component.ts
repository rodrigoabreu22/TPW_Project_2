import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-report-list',
  imports: [],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.css'
})
export class ReportListComponent {
  @Input() reports: Report[] = [];

}
