import { Component, OnInit } from "@angular/core";
import { finalize, Observable, of } from "rxjs";
import { AngorProjectInvestment, AngorProjectStats } from "@interfaces/angor.interface";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "@app/services/api.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent implements OnInit {
  angorId$: Observable<string | null>;
  projectStats$: Observable<AngorProjectStats> | null = null;
  projectInvestments$: Observable<AngorProjectInvestment[]> | null = null;
  isLoading = true;
  error: HttpErrorResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {
    this.angorId$ = this.route.paramMap.pipe(
      map(params => params.get('projectId'))
    );

    this.projectStats$ = of(null);
    this.projectInvestments$ = of([]);
  }

  ngOnInit() {
    this.angorId$.pipe(
      switchMap(angorId => {
        if (!angorId) {
          throw new Error('Angor ID is missing.');
        }

        this.isLoading = true;

        return this.apiService.getAngorProjectStats$(angorId).pipe(
          switchMap(stats => {
            this.projectStats$ = of(stats);
            return this.apiService.getAngorProjectInvestments(angorId);
          }),
          map(investments => {
            this.projectInvestments$ = of(investments);
            return investments;
          }),
          catchError(err => {
            this.error = new HttpErrorResponse({ error: 'Failed to load project data.' });
            return of([]);
          }),
          finalize(() => this.isLoading = false),
        );
      }),
      catchError(err => {
        this.error = new HttpErrorResponse({ error: 'Invalid Angor ID.'});
        this.isLoading = false;
        return of([]);
      })
    )
      .subscribe();
  }
}
