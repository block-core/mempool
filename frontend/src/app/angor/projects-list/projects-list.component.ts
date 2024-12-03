import { Component, HostBinding, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AngorProject } from "../../interfaces/angor.interface";
import { ApiService } from "../../services/api.service";

@Component({
  selector: 'app-angor',
  templateUrl: './projects-list.component.html',
  styleUrls: ['projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {
  @HostBinding('attr.dir') dir = 'ltr';

  angorProjects$: Observable<AngorProject[]> = undefined;
  nonEmptyProjects: boolean = true;
  isLoading = true;


  constructor(
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.angorProjects$ = this.apiService.getAngorProjects$();
  }
}
