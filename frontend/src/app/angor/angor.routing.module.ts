import { RouterModule, Routes } from "@angular/router";
import { ProjectsListComponent } from "@app/angor/projects-list/projects-list.component";
import { ProjectComponent } from "./project/project.component";
import { NgModule } from "@angular/core";
import { StartComponent } from "@components/start/start.component";
import { ProjectsDashboardComponent } from "@app/angor/projects-dashboard/projects-dashboard.component";

const browserWindow = window || {};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: StartComponent,
    children: [
      {
        path: '',
        component: ProjectsDashboardComponent,
      }
    ]
  },
  {
    path: 'projects/list',
    redirectTo: 'projects/list/1',
  },
  {
    path: 'projects/list/:page',
    component: ProjectsListComponent
  },
  {
    path: 'projects/:projectId',
    component: ProjectComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AngorRoutingModule { }

