import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StateService } from './state.service';

export interface AngorProject {
  id: string;
  name: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
  endDate: number;
}

export interface AngorStats {
  totalProjects: number;
  totalFunding: number;
  activeProjects: number;
}

@Injectable({
  providedIn: 'root'
})
export class AngorService {

  constructor(
    private http: HttpClient,
    private stateService: StateService
  ) { }

  private getApiUrl(): string {
    // Build API URL based on current environment
    const protocol = this.stateService.env.NGINX_PROTOCOL || 'http';
    const hostname = this.stateService.env.NGINX_HOSTNAME || 'localhost';
    const port = this.stateService.env.NGINX_PORT || '8999';
    return `${protocol}://${hostname}:${port}/api/v1`;
  }

  getProjects(): Observable<AngorProject[]> {
    return this.http.get<AngorProject[]>(
      `${this.getApiUrl()}/angor/projects`
    );
  }

  getProject(id: string): Observable<AngorProject> {
    return this.http.get<AngorProject>(
      `${this.getApiUrl()}/angor/project/${id}`
    );
  }

  getStats(): Observable<AngorStats> {
    return this.http.get<AngorStats>(
      `${this.getApiUrl()}/angor/stats`
    );
  }
}