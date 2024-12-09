import { NgModule } from "@angular/core";
import { ProjectsListComponent } from "@app/angor/projects-list/projects-list.component";
import { ProjectComponent } from "./project/project.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { AngorRoutingModule } from "@app/angor/angor.routing.module";
import { ProjectsDashboardComponent } from "@app/angor/projects-dashboard/projects-dashboard.component";

@NgModule({
  declarations: [
    ProjectsListComponent,
    ProjectsDashboardComponent,
    ProjectComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AngorRoutingModule
  ]
})
export class AngorModule{ }
