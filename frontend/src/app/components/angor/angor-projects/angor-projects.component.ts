import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngorService, AngorProject, AngorStats } from '../../../services/angor.service';

@Component({
  selector: 'app-angor-projects',
  templateUrl: './angor-projects.component.html',
  styleUrls: ['./angor-projects.component.scss']
})
export class AngorProjectsComponent implements OnInit {
  projects$: Observable<AngorProject[]>;
  stats$: Observable<AngorStats>;

  constructor(private angorService: AngorService) { }

  ngOnInit(): void {
    this.projects$ = this.angorService.getProjects();
    this.stats$ = this.angorService.getStats();
  }

  getProgressPercentage(project: AngorProject): number {
    return Math.round((project.currentFunding / project.fundingGoal) * 100);
  }

  formatSats(amount: number): string {
    return (amount / 100000000).toFixed(2) + ' L-BTC';
  }
}