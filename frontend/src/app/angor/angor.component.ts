import { Component, HostBinding, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AngorProject } from "../interfaces/angor.interface";
import { ApiService } from "../services/api.service";

@Component({
  selector: 'app-angor',
  templateUrl: './angor.component.html',
  styleUrls: ['./angor.component.css']
})
export class AngorComponent implements OnInit {
  @HostBinding('attr.dir') dir = 'ltr';

  angorProjects$: Observable<AngorProject[]> = undefined;
  isLoading = true;


  constructor(
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.angorProjects$ = this.apiService.getAngorProjects$();
  }
}
