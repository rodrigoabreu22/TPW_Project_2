import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Report } from '../report';

@Component({
  selector: 'app-report',
  imports: [CommonModule,RouterModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  @Input() report: Report | null = null;
  constructor(){}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) {
      console.log("AAAAAAAAAAAA:", this.report);
    }
  }
}
