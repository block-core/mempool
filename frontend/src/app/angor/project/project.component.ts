import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AngorProjectInvestment, AngorProjectStats } from "@interfaces/angor.interface";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "@app/services/api.service";
import { switchMap } from "rxjs/operators";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent implements OnInit {
  angorId$ = this.route.paramMap;
  projectStats$: Observable<AngorProjectStats> | null = null;
  projectInvestments$: Observable<AngorProjectInvestment[]> | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.projectStats$ = this.route.paramMap.pipe(
      switchMap(params => {
        const angorId = params.get('projectId');
        if (angorId) {
          return this.apiService.getAngorProjectStats$(angorId);
        } else {
          throw new Error("Project ID is missing");
        }
      })
    );

    this.projectInvestments$ = this.route.paramMap.pipe(
      switchMap(params => {
        const angorId = params.get('projectId');
        if (angorId) {
          return this.apiService.getAngorProjectInvestments(angorId);
        } else {
          throw new Error("Project ID is missing");
        }
      })
    );
  }


}
