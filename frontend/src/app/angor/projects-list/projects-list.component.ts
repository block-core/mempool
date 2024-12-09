import { Component, HostBinding, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AngorProject } from "../../interfaces/angor.interface";
import { ApiService } from "../../services/api.service";
import { map, switchMap, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {
  @Input() widget: boolean = false;
  @Input() projects$: Observable<AngorProject[]>;
  angorProjects$: Observable<AngorProject[]> = undefined;
  isLoading = true;
  page = 1;
  projectsCount: number;
  maxSize = window.innerWidth <= 767.98 ? 3 : 5;
  dir: 'rtl' | 'ltr' = 'ltr';


  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.angorProjects$ = this.projects$ || this.apiService.getAngorProjects$(10).pipe(
      tap(response => {
        const totalCountHeader = response.headers.get('Pagination-Total');
        if (totalCountHeader) {
          this.projectsCount = parseInt(totalCountHeader);
        }
        this.isLoading = false;
      }),
      map(response => response.body as AngorProject[])
    );
  }

}
