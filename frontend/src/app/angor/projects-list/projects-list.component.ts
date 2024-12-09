import { Component, HostBinding, Input, OnInit } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, Subscription, timer } from "rxjs";
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
  pageSubject: BehaviorSubject<number> = new BehaviorSubject(this.page);
  paramSubscription: Subscription;
  projectsCount: number;
  skeletonLines: number[] = [];
  maxSize = window.innerWidth <= 767.98 ? 3 : 5;
  dir: 'rtl' | 'ltr' = 'ltr';


  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.paramSubscription = combineLatest([
      this.route.params,
      timer(0),
    ]).pipe(
      tap(([params]) => {
        this.page = +params['page'] || 1;
        this.pageSubject.next(this.page);
      })
    ).subscribe();

    this.skeletonLines = Array.from({ length: this.widget ? 10 : 15 }, (_, i) => i);

    this.angorProjects$ = this.projects$ || this.pageSubject.pipe(
      tap(() => this.isLoading = true),
      switchMap(page =>
        this.apiService.getAngorProjects$(15, page).pipe(
          tap(response => {
            const totalCountHeader = response.headers.get('Pagination-Total');
            if (totalCountHeader) {
              this.projectsCount = parseInt(totalCountHeader);
            }
            this.isLoading = false;
          }),
          map(response => response.body as AngorProject[])
        )
      )
    );
  }

  pageChange(page: number): void {
    this.pageSubject.next(page);
    this.router.navigate(['../', page], {relativeTo: this.route });
  }

}
