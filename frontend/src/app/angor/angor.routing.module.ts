import { RouterModule, Routes } from "@angular/router";
import { ProjectsListComponent } from "./projects-list/projects-list.component";
import { ProjectComponent } from "./project/project.component";
import { NgModule } from "@angular/core";

const browserWindow = window || {};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'projects'
  },
  {
    path: 'projects',
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

