import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AngorProject } from "../../interfaces/angor.interface";
import { ApiService } from "../../services/api.service";
import { map, tap } from "rxjs/operators";

@Component({
  selector: 'app-projects-dashboard',
  templateUrl: './projects-dashboard.component.html',
  styleUrls: ['./projects-dashboard.component.scss']
})
export class ProjectsDashboardComponent implements OnInit {
  projects$: Observable<AngorProject[]>;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.projects$ = this.apiService.getAngorProjects$(10, 1).pipe(
      map(response => response.body as AngorProject[])
    );
  }
}
